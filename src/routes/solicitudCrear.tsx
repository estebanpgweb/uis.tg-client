import { useState, useEffect } from "react";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { Materia } from "@/types/materiaTypes";
import { useToast } from "@/hooks/use-toast";
import Materias from "@/components/materias";
import Calendario from "@/components/calendario";
import { Solicitud } from "@/types/solicitudesTypes";
import { isTimeOverlap } from "@/utils/tiempoEspera";
import { updateSolicitud, hasPendingChanges } from "@/utils/solicitudCrear";

const SolicitudCrearRoute = () => {
  const axios: AxiosInstance = useAxios();
  const [horarioInicial, setHorarioInicial] = useState<Materia[]>([]);
  const [horario, setHorario] = useState<Materia[]>([
    {
      _id: "676ef7cb6b6d1036fd789f80",
      name: "Cálculo I",
      sku: "20252",
      level: 1,
      credits: 4,
      groups: [
        {
          sku: "Z1",
          schedule: [
            {
              dia: "VIERNES",
              hora: "6-8",
              edificio: "A",
              aula: "101",
              profesor: "Prof. A",
            },
            {
              dia: "MIERCOLES",
              hora: "6-8",
              edificio: "A",
              aula: "101",
              profesor: "Prof. A",
            },
          ],
        },
      ],
    },
    {
      _id: "2",
      name: "Materia 2",
      sku: "MAT-2",
      level: 1,
      credits: 4,
      groups: [
        {
          sku: "01",
          schedule: [
            {
              dia: "MARTES",
              hora: "6-7",
              edificio: "B",
              aula: "102",
              profesor: "Prof. B",
            },
            {
              dia: "JUEVES",
              hora: "6-7",
              edificio: "B",
              aula: "102",
              profesor: "Prof. B",
            },
          ],
        },
      ],
    },
    {
      _id: "3",
      name: "Materia 3",
      sku: "MAT-3",
      level: 1,
      credits: 4,
      groups: [
        {
          sku: "02",
          schedule: [
            {
              dia: "LUNES",
              hora: "10-11",
              edificio: "C",
              aula: "103",
              profesor: "Prof. C",
            },
            {
              dia: "MIERCOLES",
              hora: "10-11",
              edificio: "C",
              aula: "103",
              profesor: "Prof. C",
            },
          ],
        },
      ],
    },
  ]);
  const emptySolicitud: Solicitud = {
    status: "PENDING",
    requests: [],
  };
  const [solicitud, setSolicitud] = useState<Solicitud>(emptySolicitud);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setHorarioInicial(horario);
  }, []);

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

  const checkMateriaConflict = (
    existingSchedule: Materia["groups"][0]["schedule"],
    newSchedule: Materia["groups"][0]["schedule"]
  ): boolean => {
    return existingSchedule.some((existing) =>
      newSchedule.some((newSlot) => {
        if (existing.dia.toUpperCase() === newSlot.dia.toUpperCase()) {
          return isTimeOverlap(existing.hora, newSlot.hora);
        }
        return false;
      })
    );
  };

  const handleGroupSelection = (
    materia: Materia,
    group: Materia["groups"][0]
  ) => {
    const hasMateria = horario.some((m) => m._id === materia._id);
    const isCurrentlySelected = isGroupSelected(materia._id, group.sku);

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
    }

    const hasConflict = horario.some(
      (existingMateria) =>
        existingMateria._id !== materia._id &&
        existingMateria.groups.some((existingGroup) =>
          checkMateriaConflict(existingGroup.schedule, group.schedule)
        )
    );

    if (hasConflict) {
      toast({
        variant: "destructive",
        title: "Conflicto de horario",
        description: "Este grupo se cruza con otra materia ya seleccionada.",
      });
      return;
    }

    setHorario((prevHorario) => {
      if (hasMateria) {
        return prevHorario.map((m) => {
          if (m._id === materia._id) {
            return { ...m, groups: [...m.groups, group] };
          }
          return m;
        });
      } else {
        return [...prevHorario, { ...materia, groups: [group] }];
      }
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

  if (isLoading) {
    return <div className="text-center p-4">Cargando horario...</div>;
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold">Solicitud ajuste de matricula</h1>
      <div className="flex w-full my-4 gap-x-8 justify-between">
        <div className="flex-1 w-4/5">
          <Calendario
            horario={horario}
            handleRemoveMateria={handleRemoveGrupo}
            handleSave={handleSaveSolicitud}
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
