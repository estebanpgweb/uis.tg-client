import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthContext";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { Materia } from "@/types/materiaTypes";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Materias from "@/components/materias";
import Calendario from "@/components/calendario";
import { Solicitud } from "@/types/solicitudesTypes";
import { isTimeOverlap } from "@/utils/tiempoEspera";
import { updateSolicitud, hasPendingChanges } from "@/utils/solicitudCrear";
import Loader from "@/components/loader";

const SolicitudCrearRoute = () => {
  const axios: AxiosInstance = useAxios();
  const [horarioInicial, setHorarioInicial] = useState<Materia[]>([]);
  const [horario, setHorario] = useState<Materia[]>([]);
  const emptySolicitud: Solicitud = {
    status: "PENDING",
    requests: [],
  };
  const [solicitud, setSolicitud] = useState<Solicitud>(emptySolicitud);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const userId = auth?.user?.id;
  const navigate = useNavigate();

  // Actualizar la solicitud cuando cambia el horario
  useEffect(() => {
    if (horarioInicial.length > 0) {
      const updatedSolicitud = updateSolicitud(
        solicitud,
        horarioInicial,
        horario
      );
      setSolicitud(updatedSolicitud);
    }
  }, [horario]);

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

  const checkMateriaConflict = (
    existingSchedule: Materia["groups"][0]["schedule"],
    newSchedule: Materia["groups"][0]["schedule"]
  ): boolean => {
    return existingSchedule.some((existing) =>
      newSchedule.some((newSlot) => {
        if (existing.day.toUpperCase() === newSlot.day.toUpperCase()) {
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
    const hasConflict = horario.some(
      (existingMateria) =>
        existingMateria._id !== materia._id &&
        existingMateria.groups.some((existingGroup) =>
          checkMateriaConflict(existingGroup.schedule, group.schedule)
        )
    );

    // Si el grupo ya está seleccionado, permitimos la deselección
    if (isCurrentlySelected) {
      console.log("selected", hasConflict);
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
      console.log("hasMateria", hasConflict);
      // si la materia ya está en el horario, verificar si se puede agregar el grupo
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
            return { ...m, groups: [...m.groups, group] };
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

    // Verificar conflictos con todas las materias en el horario
    if (hasConflict) {
      toast({
        variant: "destructive",
        title: "Conflicto de horario",
        description: "Este grupo se cruza con otra materia ya seleccionada.",
      });
      return;
    }

    // Agregar nueva materia con el grupo seleccionado
    setHorario((prevHorario) => {
      return [...prevHorario, { ...materia, groups: [group] }];
    });
    toast({
      title: "Grupo añadido",
      description: `Grupo ${group.sku} de ${materia.name} añadido al horario`,
    });
  };

  const isGroupSelected = (materiaId: string, groupSku: string) => {
    return horario.some(
      (m) => m._id === materiaId && m.groups.some((g) => g.sku === groupSku)
    );
  };

  const handleRemoveGrupo = (
    materiaId: string,
    groupSku?: string,
    isInicial?: boolean
  ) => {
    if (isInicial) {
      // Buscar el grupo inicial que queremos restaurar
      const materiaInicial = horarioInicial.find((m) => m._id === materiaId);
      const groupInicial = materiaInicial?.groups.find(
        (g) => g.sku === groupSku
      );

      if (materiaInicial && groupInicial) {
        // Verificar conflictos antes de restaurar
        const hasConflict = horario.some(
          (existingMateria) =>
            existingMateria._id !== materiaId &&
            existingMateria.groups.some((existingGroup) =>
              checkMateriaConflict(
                existingGroup.schedule,
                groupInicial.schedule
              )
            )
        );

        if (hasConflict) {
          toast({
            variant: "destructive",
            title: "Conflicto de horario",
            description:
              "No se puede restaurar el grupo debido a conflictos con otras materias.",
          });
          return;
        }

        // Actualizar el horario manteniendo los cambios existentes
        setHorario((prevHorario) => {
          const materiaExists = prevHorario.some((m) => m._id === materiaId);

          if (materiaExists) {
            return prevHorario.map((m) => {
              if (m._id === materiaId) {
                return {
                  ...m,
                  groups: [...m.groups, groupInicial],
                };
              }
              return m;
            });
          } else {
            return [
              ...prevHorario,
              { ...materiaInicial, groups: [groupInicial] },
            ];
          }
        });

        toast({
          title: "Grupo restaurado",
          description: `Grupo ${groupSku} de ${materiaInicial.name} restaurado al horario`,
        });
      }
    } else {
      // Lógica existente para remover grupos no iniciales
      setHorario(
        (prevHorario) =>
          prevHorario
            .map((m) => {
              if (m._id === materiaId) {
                const newGroups = m.groups.filter((g) => g.sku !== groupSku);
                if (newGroups.length === 0) {
                  return null;
                }
                return { ...m, groups: newGroups };
              }
              return m;
            })
            .filter(Boolean) as Materia[]
      );

      const materiaName = materias.find((m) => m._id === materiaId)?.name;
      toast({
        variant: "destructive",
        title: "Grupo removido",
        description: `Grupo ${groupSku} de ${materiaName} removido del horario`,
      });
    }
  };

  // Función para guardar la solicitud
  const handleSaveSolicitud = async () => {
    if (!hasPendingChanges(horarioInicial, horario)) {
      toast({
        variant: "destructive",
        title: "Sin cambios",
        description: "No hay cambios pendientes para guardar",
      });
      return;
    }

    try {
      setIsLoading(true);
      const updatedSolicitud = updateSolicitud(
        solicitud,
        horarioInicial,
        horario
      );
      await axios.post("/api/appeal", updatedSolicitud);

      toast({
        title: "Solicitud guardada",
        description: "Los cambios han sido guardados exitosamente",
      });
      navigate("/solicitudes");
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (error as Error).message ||
        "Ha ocurrido un error inesperado";

      toast({
        variant: "destructive",
        title: "Error al guardar solicitud",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Loader isLoading={isLoading} />
      <h1 className="text-2xl font-bold">Solicitud ajuste de matricula</h1>
      <div className="flex w-full my-4 gap-x-8 justify-between">
        <div className="flex-1 w-4/5">
          <Calendario
            horario={horario}
            handleRemoveMateria={handleRemoveGrupo}
            handleSave={handleSaveSolicitud}
            horarioInicial={horarioInicial}
            solicitudes={solicitud.requests}
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

export default SolicitudCrearRoute;
