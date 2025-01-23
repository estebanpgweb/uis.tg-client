import { useState, useEffect } from "react";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { useAuth } from "@/providers/AuthContext";
import { Materia } from "@/types/materiaTypes";
import { useToast } from "@/hooks/use-toast";
import Materias from "@/components/materias";
import Calendario from "@/components/calendario";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isTimeOverlap } from "@/utils/tiempoEspera";
import Loader from "@/components/loader";
import { Sun, Moon } from "lucide-react";

const HorarioRoute = () => {
  const axios: AxiosInstance = useAxios();
  const [horario, setHorario] = useState<Materia[]>([]);
  const [horarioInicial, setHorarioInicial] = useState<Materia[]>([]);
  const [idHorario, setIdHorario] = useState<string | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const userId = auth?.user?.id;
  const userShift = auth?.user?.shift;
  const [shift, setShift] = useState<{ day: string; time: string } | null>(
    userShift || { day: "", time: "" }
  );

  const daysAndShifts = [
    { day: "MONDAY", label: "Lunes" },
    { day: "TUESDAY", label: "Martes" },
    { day: "WEDNESDAY", label: "Miércoles" },
  ];

  useEffect(() => {
    setDialogOpen(!userShift);
  }, [userShift]);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/subjects`);
        setMaterias(data);
      } catch (error) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message ||
          (error as Error).message ||
          "Ha ocurrido un error inesperado";

        toast({
          variant: "destructive",
          title: "Materias fallidas",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterias();
  }, [axios, toast]);

  useEffect(() => {
    if (!userId) return;

    const fetchHorario = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/schedule`, {
          headers: { "x-resource-id": userId },
        });
        const subjects =
          data.length > 0
            ? data[0].subjects.map((subject: Materia) => {
                return {
                  ...subject,
                  groups: [subject.group],
                };
              })
            : [];

        if (data.length > 0) {
          setIdHorario(data[0]._id);
          setHorario(subjects);
          setHorarioInicial(subjects);
        }
      } catch (error) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message ||
          (error as Error).message ||
          "Ha ocurrido un error inesperado";

        toast({
          variant: "destructive",
          title: "Horario fallida",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHorario();
  }, [axios, toast, userId]);

  // Función mejorada para verificar conflictos de horario
  const checkScheduleConflict = (
    existingSchedule: Materia["groups"][0]["schedule"],
    newSchedule: Materia["groups"][0]["schedule"]
  ): boolean => {
    return existingSchedule.some((existing) =>
      newSchedule.some((newSlot) => {
        // Primero verificamos si es el mismo día
        if (existing.day.toUpperCase() === newSlot.day.toUpperCase()) {
          // Luego verificamos si hay solapamiento en las horas
          return isTimeOverlap(existing.time, newSlot.time);
        }
        return false;
      })
    );
  };

  const checkMateriaRequirements = (
    materia: Materia,
    checkedSkus: Set<string> = new Set()
  ): string | undefined => {
    // Evitar ciclos infinitos
    if (checkedSkus.has(materia.sku)) {
      return undefined;
    }
    checkedSkus.add(materia.sku);

    const requisitos = materia.requirements || [];

    // Verificar si algún requisito está en el horario actual
    const simultaneousRequisite = requisitos.find((requisite) =>
      horario.some((m) => m.sku === requisite)
    );

    if (simultaneousRequisite) {
      const requisiteName = materias.find(
        (m) => m.sku === simultaneousRequisite
      )?.name;
      return `La materia no cumple el requisito de ${requisiteName}`;
    }

    // Verificar los prerequisitos de cada requisito recursivamente
    for (const requisiteSku of requisitos) {
      const requisitoMateria = materias.find((m) => m.sku === requisiteSku);
      if (requisitoMateria) {
        const subRequirement = checkMateriaRequirements(
          requisitoMateria,
          checkedSkus
        );
        if (subRequirement) {
          return subRequirement;
        }
      }
    }

    //validamos que no sea una materia ya vista mirando los requisitos de las materias que ya estan en el horario
    const requisitosMateriaEnHorario = materias
      .filter((m) => {
        return horario.some((h) => h._id === m._id);
      })
      .flatMap((m) => m.requirements || []);
    if (requisitosMateriaEnHorario.includes(materia.sku)) {
      return `Materia ${materia.name} ya fue vista, no se puede agregar`;
    }

    // Si no tiene requisitos, se puede agregar
    if (!requisitos?.length) {
      return undefined;
    }

    return undefined;
  };

  const handleGroupSelection = (
    materia: Materia,
    group: Materia["groups"][0]
  ) => {
    // Verificar si la materia ya está en el horario
    const hasMateria = horario.some((m) => m._id === materia._id);
    const isCurrentlySelected = isGroupSelected(materia._id, group.sku);
    // Verificar conflictos con todas las materias en el horario
    const hasConflict = horario.some((existingMateria) =>
      existingMateria.groups.some((existingGroup) =>
        checkScheduleConflict(existingGroup.schedule, group.schedule)
      )
    );

    // Si el grupo ya está seleccionado, permitimos la deselección
    if (isCurrentlySelected) {
      setHorario((prevHorario) => {
        const newHorario = prevHorario.map((m) => {
          if (m._id === materia._id) {
            const newGroups = m.groups.filter((g) => g.sku !== group.sku);
            if (newGroups.length === 0) {
              return null;
            }
            return { ...m, groups: newGroups };
          }
          return m;
        });
        return newHorario.filter(Boolean) as Materia[];
      });

      toast({
        variant: "destructive",
        title: "Grupo removido",
        description: `Grupo ${group.sku} de ${materia.name} removido del horario`,
      });
      return;
    } else if (hasMateria) {
      //Verificar si no tiene conflictos con los grupos de la materia
      if (hasConflict) {
        toast({
          variant: "destructive",
          title: "Conflicto de horario",
          description: "Este grupo se cruza con otra materia ya seleccionada.",
        });
        return;
      }
      // Actualizar el grupo de la materia existente
      setHorario((prevHorario) =>
        prevHorario.map((m) => {
          if (m._id === materia._id) {
            return { ...m, groups: [group] };
          }
          return m;
        })
      );

      toast({
        title: "Grupo actualizado",
        description: `Grupo ${group.sku} de ${materia.name} añadido al horario`,
      });
      return;
    }

    // Verificar si cumple con los requisitos de la materia
    const hasRequirements = checkMateriaRequirements(materia);
    if (hasRequirements) {
      toast({
        variant: "destructive",
        title: "Requisitos no cumplidos",
        description: `${hasRequirements}`,
      });
      return;
    }

    // Verificar si hay conflictos de horario
    if (hasConflict && !hasMateria) {
      toast({
        variant: "destructive",
        title: "Conflicto de horario",
        description: "Este grupo se cruza con otra materia ya seleccionado.",
      });
      return;
    }

    // Agregar nueva materia con el grupo seleccionado
    setHorario((prevHorario) => {
      return [...prevHorario, { ...materia, groups: [group] }];
    });
    toast({
      title: "Grupo actualizado",
      description: `Grupo ${group.sku} de ${materia.name} añadido al horario`,
    });
  };

  const isGroupSelected = (materiaId: string, groupSku: string) => {
    return horario.some(
      (m) => m._id === materiaId && m.groups.some((g) => g.sku === groupSku)
    );
  };

  const handleRemoveMateria = (materiaId: string) => {
    const newHorario = horario.filter((m) => m._id !== materiaId);
    setHorario(newHorario);
  };

  const handleSaveSchedule = async () => {
    if (!userShift) {
      setDialogOpen(true);
      return;
    }

    if (horario.length === 0) {
      toast({
        variant: "destructive",
        title: "Horario vacío",
        description: "Debe registrar al menos una asignatura.",
      });
      return;
    }
    try {
      setIsLoading(true);
      if (horarioInicial === horario) {
        toast({
          variant: "destructive",
          title: "Sin cambios",
          description: "No hay cambios pendientes para guardar",
        });
        return;
      }
      const formatedHorario = {
        subjects: horario.map((m) => {
          return {
            ...m,
            group: {
              ...m.groups[0],
              schedule: m.groups[0].schedule.map((slot) => {
                const [start, end] = slot.time.split("-");
                return {
                  ...slot,
                  start,
                  end,
                };
              }),
            },
          };
        }),
      };

      if (horarioInicial.length === 0 && idHorario === null) {
        await axios.post(`/api/schedule`, formatedHorario);
      } else {
        await axios.put(`/api/schedule/${idHorario}`, formatedHorario, {
          headers: { "x-resource-id": userId },
        });
      }

      toast({
        title: "Horario guardado",
        description: "El horario ha sido guardado exitosamente.",
      });
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (error as Error).message ||
        "Ha ocurrido un error inesperado";

      toast({
        variant: "destructive",
        title: "Guardar horario fallido",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserShift = async () => {
    if (!shift || !userId) return;

    try {
      setIsLoading(true);
      await axios.put(
        `/api/student`,
        { shift },
        { headers: { "x-resource-id": userId } }
      );
      setDialogOpen(false);
      toast({
        title: "Franja horaria actualizada",
        description: "La franja horaria ha sido actualizada exitosamente.",
      });
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (error as Error).message ||
        "Ha ocurrido un error inesperado";

      toast({
        variant: "destructive",
        title: "Actualizar franja horaria fallida",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Loader isLoading={isLoading} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selección de Franja Horaria</DialogTitle>
            <DialogDescription>
              Elige el día y la franja horaria que te fue asignada en el sistema
              de estudiantes UIS.
              <div className="grid grid-cols-3 gap-4 mt-4">
                {daysAndShifts.map(({ day, label }) => (
                  <Card key={day}>
                    <CardHeader className="text-center">
                      <CardTitle>{label}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-y-2">
                      <Button
                        className="text-sm"
                        variant={
                          shift?.day === day && shift?.time === "AM"
                            ? "default"
                            : "secondary"
                        }
                        onClick={() => setShift({ day, time: "AM" })}
                      >
                        <Sun />
                        Mañana
                      </Button>
                      <Button
                        className="text-sm"
                        variant={
                          shift?.day === day && shift?.time === "PM"
                            ? "default"
                            : "secondary"
                        }
                        onClick={() => setShift({ day, time: "PM" })}
                      >
                        <Moon />
                        Tarde
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => handleUserShift()}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <h1 className="text-2xl font-bold">Horario del estudiante</h1>
      <div className="flex w-full my-4 gap-x-8 justify-between">
        <div className="flex-1 w-4/5">
          <Calendario
            horario={horario}
            handleRemoveMateria={handleRemoveMateria}
            handleSave={handleSaveSchedule}
          />
        </div>

        <div className="w-1/5">
          <Materias
            materias={materias}
            onGroupSelect={handleGroupSelection}
            isGroupSelected={isGroupSelected}
          />
        </div>
      </div>
    </div>
  );
};

export default HorarioRoute;
