import { useState, useEffect } from "react";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { Materia } from "@/types/materiaTypes";
import { useToast } from "@/hooks/use-toast";
import Materias from "@/components/materias";
import Calendario from "@/components/calendario";
import { isTimeOverlap } from "@/utils/tiempoEspera";
import { useAuth } from "@/providers/AuthContext";

const HorarioRoute = () => {
  const axios: AxiosInstance = useAxios();
  const [horario, setHorario] = useState<Materia[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const user = auth?.user;

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
    const fetchHorario = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/schedule`);
        const sucjects = data?.subjects || [];
        setHorario(sucjects);
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
  }, [axios, toast]);

  // Función mejorada para verificar conflictos de horario
  const checkScheduleConflict = (
    existingSchedule: Materia["groups"][0]["schedule"],
    newSchedule: Materia["groups"][0]["schedule"]
  ): boolean => {
    return existingSchedule.some((existing) =>
      newSchedule.some((newSlot) => {
        // Primero verificamos si es el mismo día
        if (existing.dia.toUpperCase() === newSlot.dia.toUpperCase()) {
          // Luego verificamos si hay solapamiento en las horas
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
    // Verificar si la materia ya está en el horario
    const hasMateria = horario.some((m) => m._id === materia._id);
    const isCurrentlySelected = isGroupSelected(materia._id, group.sku);

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
    }

    // Verificar conflictos con todas las materias en el horario
    const hasConflict = horario.some((existingMateria) =>
      existingMateria.groups.some((existingGroup) =>
        checkScheduleConflict(existingGroup.schedule, group.schedule)
      )
    );

    if (hasConflict && !hasMateria) {
      toast({
        variant: "destructive",
        title: "Conflicto de horario",
        description: "Este grupo se cruza con otro ya seleccionado.",
      });
      return;
    }

    setHorario((prevHorario) => {
      if (hasMateria) {
        // Actualizar el grupo de la materia existente
        return prevHorario.map((m) => {
          if (m._id === materia._id) {
            return { ...m, groups: [group] };
          }
          return m;
        });
      } else {
        // Agregar nueva materia con el grupo
        return [...prevHorario, { ...materia, groups: [group] }];
      }
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
      const formatedHorario = {
        studentId: user.id,
        subjects: horario.map((m) => m),
      };
      console.log(formatedHorario);
      await axios.post(`/api/schedule`, formatedHorario);
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

  if (isLoading) {
    return <div className="text-center p-4">Cargando horario...</div>;
  }

  return (
    <div className="w-full">
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
