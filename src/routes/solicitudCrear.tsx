import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthContext";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { Materia } from "@/types/materiaTypes";
import { useToast } from "@/hooks/use-toast";
import Materias from "@/components/materias";
import Calendario from "@/components/calendario";
import { Solicitud } from "@/types/solicitudesTypes";
import { isTimeOverlap } from "@/utils/tiempoEspera";

const SolicitudCrearRoute = () => {
  const axios: AxiosInstance = useAxios();
  const { user } = useAuth();
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
              hora: "10-12",
              edificio: "C",
              aula: "103",
              profesor: "Prof. C",
            },
            {
              dia: "MIERCOLES",
              hora: "10-12",
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
    student: {
      name: user.name,
      lastname: user.lastname,
      username: user.username,
      identification: user.identification || "",
    },
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

  // Función para verificar si hay conflicto entre materias (no entre grupos de la misma materia)
  const checkMateriaConflict = (
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

    // Verificar conflictos solo con otras materias
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
        description: "Este grupo se solapa con otra materia ya seleccionada.",
      });
      return;
    }

    setHorario((prevHorario) => {
      if (hasMateria) {
        // Solo agregar el nuevo grupo sin quitar los anteriores
        return prevHorario.map((m) => {
          if (m._id === materia._id) {
            return { ...m, groups: [...m.groups, group] };
          }
          return m;
        });
      } else {
        // Agregar nueva materia con el grupo
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
    console.log(materiaId, groupSku, isInicial);
    const newHorario = isInicial
      ? //vuelve a poner el grupo en el horario
        horarioInicial.map((m) => {
          if (m._id === materiaId) {
            return { ...m, groups: m.groups };
          }
          return m;
        })
      : horario.map((m) => {
          if (m._id === materiaId) {
            const newGroups = m.groups.filter((g) => g.sku !== groupSku);
            return { ...m, groups: newGroups };
          }
          return m;
        });
    console.log(newHorario);

    setHorario(newHorario);
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
