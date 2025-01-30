import { useState, useEffect } from "react";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Solicitud, validateShiftTiming } from "@/types/solicitudesTypes";
import { Pie, PieChart, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Sun, Moon } from "lucide-react";
import { getStatusLabel } from "@/types/solicitudesTypes";
import Loader from "@/components/loader";

const daysAndShifts = [
  { day: "WEDNESDAY", label: "Miércoles" },
  { day: "THURSDAY", label: "Jueves" },
  { day: "FRIDAY", label: "Viernes" },
];

export default function EstadisticasRoute() {
  const [isLoading, setIsLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [solicitudesAtendidas, setSolicitudesAtendidas] = useState<Solicitud[]>(
    []
  );
  const [solicitudesSinAtender, setSolicitudesSinAtender] = useState<
    Solicitud[]
  >([]);
  type solicitudesChart = {
    status: string;
    count: number;
    fill: string;
    tiempoPromedio?: string;
  };
  const [solicitudesPorGrupo, setSolicitudesPorGrupo] = useState<
    solicitudesChart[]
  >([]);
  const [solicitudesPorTipo, setSolicitudesPorTipo] = useState<
    solicitudesChart[]
  >([]);
  const [solicitudesPorIntentos, setSolicitudesPorIntentos] = useState<
    solicitudesChart[]
  >([]);
  const [solicitudesPorFranja, setSolicitudesPorFranja] = useState<
    solicitudesChart[]
  >([]);
  const [tiempoRespuestaFranja, setTiempoRespuestaFranja] = useState<
    solicitudesChart[]
  >([]);
  const axios: AxiosInstance = useAxios();
  const { toast } = useToast();
  const franjasTotales = [
    { day: "WEDNESDAY", time: "AM", label: "Mie AM" },
    { day: "WEDNESDAY", time: "PM", label: "Mie PM" },
    { day: "THURSDAY", time: "AM", label: "Jue AM" },
    { day: "THURSDAY", time: "PM", label: "Jue PM" },
    { day: "FRIDAY", time: "AM", label: "Vie AM" },
    { day: "FRIDAY", time: "PM", label: "Vie PM" },
  ];

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        setIsLoading(true);

        const { data } = await axios.get(`/api/appeal`);
        setSolicitudes(data);
      } catch (error) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message ||
          (error as Error).message ||
          "Ha ocurrido un error inesperado";

        toast({
          variant: "destructive",
          title: "Estadisticas fallidas",
          description: errorMessage,
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolicitudes();
  }, [axios, toast]);

  useEffect(() => {
    setSolicitudesAtendidas(
      solicitudes.filter(
        (solicitud: Solicitud) =>
          solicitud.status !== "PENDING" && solicitud.status !== "REVIEW"
      )
    );
    setSolicitudesSinAtender(
      solicitudes.filter(
        (solicitud: Solicitud) =>
          solicitud.status === "PENDING" || solicitud.status === "REVIEW"
      )
    );

    setSolicitudesPorGrupo(
      //agrupamos las solicitudes por status, contamos y le cambiamos el status por su label
      solicitudes.reduce((acc, solicitud) => {
        const status = getStatusLabel(solicitud.status || "PENDING");
        const existing = acc.find((item) => item.status === status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({
            status,
            count: 1,
            fill: `hsl(var(--chart-${acc.length + 1}))`,
          });
        }
        return acc;
      }, [] as solicitudesChart[])
    );

    // Función auxiliar para determinar el tipo de request
    const getTipoRequest = (request: Solicitud["requests"][0]): string => {
      if (!request) return "Sin tipo";

      if (request.from && !request.to) {
        return "Cancelación";
      } else if (!request.from && request.to) {
        return "Inclusión";
      } else if (request.from && request.to) {
        return "Cambio de grupo";
      }

      return "Otro";
    };

    setSolicitudesPorTipo(
      solicitudes.reduce((acc, solicitud) => {
        // Por cada solicitud, procesamos todas sus requests
        solicitud.requests.forEach((request) => {
          const tipo = getTipoRequest(request);
          const existing = acc.find((item) => item.status === tipo);

          if (existing) {
            existing.count++;
          } else {
            acc.push({
              status: tipo,
              count: 1,
              fill: `hsl(var(--chart-${acc.length + 1}))`,
            });
          }
        });

        return acc;
      }, [] as solicitudesChart[])
    );
    // Primero creamos un objeto temporal para contar las solicitudes por estudiante
    const conteosPorEstudiante = solicitudes.reduce((acc, solicitud) => {
      const studentId = solicitud.student?.identification;
      if (!studentId) return acc;

      acc[studentId] = (acc[studentId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Luego agrupamos por número de intentos
    setSolicitudesPorIntentos(
      Object.entries(conteosPorEstudiante)
        .reduce((acc, [, intentos]) => {
          const label = `${intentos} ${
            intentos === 1 ? "intento" : "intentos"
          }`;
          const existing = acc.find((item) => item.status === label);

          if (existing) {
            existing.count++;
          } else {
            acc.push({
              status: label,
              count: 1,
              fill: `hsl(var(--chart-${acc.length + 1}))`,
            });
          }
          return acc;
        }, [] as solicitudesChart[])
        .sort((a, b) => parseInt(a.status) - parseInt(b.status))
    );

    // Calculamos el tiempo de respuesta promedio por franja o shift
    const conteoPorFranjasTotales: solicitudesChart[] = franjasTotales.map(
      (franja, index) => {
        const solicitudesFranja = solicitudesAtendidas.filter(
          (solicitud) =>
            solicitud.student?.shift?.day === franja.day &&
            solicitud.student?.shift?.time === franja.time &&
            solicitud.createdAt &&
            solicitud.updatedAt // Solo consideramos solicitudes con fechas válidas
        );

        const tiempoTotal = solicitudesFranja.reduce((acc, solicitud) => {
          const tiempoDiferencia =
            new Date(solicitud.updatedAt!).getTime() -
            new Date(solicitud.createdAt!).getTime();
          return acc + tiempoDiferencia;
        }, 0);

        // Solo calculamos el promedio si hay solicitudes válidas
        const tiempoPromedio = solicitudesFranja.length
          ? tiempoTotal / solicitudesFranja.length / 1000 / 60 / 60 // convertimos a horas
          : 0;

        return {
          status: franja.label,
          count: solicitudesFranja.length,
          fill: `hsl(var(--chart-${index + 1}))`,
          tiempoPromedio: tiempoPromedio
            ? tiempoPromedio.toFixed(2) + " h"
            : "n/a", // Redondeamos a 2 decimales
        };
      }
    );

    setTiempoRespuestaFranja(conteoPorFranjasTotales);

    // calculamos el total de solicitudes por franja
    const conteoPorFranjas: solicitudesChart[] = franjasTotales.map(
      (franja, index) => {
        const solicitudesFranja = solicitudesAtendidas.filter(
          (solicitud) =>
            solicitud.student?.shift?.day === franja.day &&
            solicitud.student?.shift?.time === franja.time
        );

        return {
          status: franja.label,
          count: solicitudesFranja.length,
          fill: `hsl(var(--chart-${index + 1}))`,
        };
      }
    );

    setSolicitudesPorFranja(conteoPorFranjas);
  }, [solicitudes]);

  return (
    <div className="container mx-auto">
      <Loader isLoading={isLoading} />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Estadísticas de solicitudes</h1>
      </div>
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-y-2 gap-x-6 pt-2 md:pt-6">
          <Card className="flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Solicitudes totales</h3>
            <p className="text-2xl font-semibold ml-4">{solicitudes.length}</p>
            <span className="opacity-50">
              solicitudes registradas en el sistema
            </span>
          </Card>
          <Card className="flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Tiempo promedio de respuesta</h3>
            <p className="text-2xl font-semibold ml-4">
              {
                //calculamos un tiempo de respuesta promedio comparando el tiempo de creacion con el tiempo de ultima actualizacion cuando son status estas completadas
                (solicitudesAtendidas.length === 0
                  ? 0
                  : solicitudesAtendidas.reduce((acc, solicitud) => {
                      const hora = validateShiftTiming(solicitud);

                      const createdAt = hora ? new Date(hora) : new Date();
                      const updatedAt = solicitud.updatedAt
                        ? new Date(solicitud.updatedAt)
                        : new Date();
                      // console.log(
                      //   `time: ${hora}`,
                      //   (updatedAt.getTime() - createdAt.getTime()) /
                      //     1000 /
                      //     60 /
                      //     60
                      // );

                      return acc + (updatedAt.getTime() - createdAt.getTime());
                    }, 0) /
                    solicitudesAtendidas.length /
                    1000 /
                    60 /
                    60
                ).toFixed(1) + " h"
              }
            </p>
            <span className="opacity-50">
              en {solicitudesAtendidas.length} solicitudes atendidas
            </span>
          </Card>
          <Card className="flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Atendidas VS sin atender</h3>
            <p className="text-2xl font-semibold ml-4">
              {
                //porcentaje de solicitudes atendidas
                (
                  (solicitudesAtendidas.length / solicitudes.length) *
                  100
                ).toFixed(1) + "% atendidas"
              }
            </p>
            <span className="opacity-50">
              {
                //conteo de solicitudes atendidas vs sin atender
                solicitudesAtendidas.length +
                  " atendidas / " +
                  solicitudesSinAtender.length +
                  " sin atender"
              }
            </span>
          </Card>
        </div>
        <div className="flex flex-col md:flex-row w-full justify-between gap-y-2 gap-x-6">
          <Card className="w-full flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Tiempo promedio de respuesta por franja horaria</h3>
            <div className="flex flex-col md:flex-row gap-4 w-full justify-between items-center">
              {daysAndShifts.map(({ day, label }) => (
                <Card key={day} className="w-full">
                  <CardHeader className="text-center !py-2 md:!py-4">
                    <CardTitle>{label}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-y-2">
                    {franjasTotales
                      .filter((franja) => franja.day === day)
                      .map((franja) => {
                        const franjaData = tiempoRespuestaFranja.find(
                          (f) => f.status === franja.label
                        );
                        return (
                          <div
                            key={franja.label}
                            className="flex justify-between items-center bg-template rounded-md px-4 py-2"
                          >
                            {franja.time == "AM" ? <Sun /> : <Moon />}
                            <span>{franja.time}</span>
                            <span>{franjaData?.tiempoPromedio || 0}</span>
                          </div>
                        );
                      })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </Card>
        </div>
        <div className="flex flex-col md:flex-row w-full justify-between gap-y-2 gap-x-6">
          <Card className="w-full flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Estado de solicitudes</h3>
            <span className="opacity-50">Estado de todas las solicitudes</span>
            <ChartContainer config={{}} className="mx-auto w-full min-h-[80px]">
              <PieChart margin={{ top: 15 }}>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={solicitudesPorGrupo}
                  dataKey="count"
                  nameKey="status"
                  label={({ count, percent }) =>
                    `${count} (${(percent * 100).toFixed(0)}%)`
                  }
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ChartContainer>
          </Card>
          <Card className="w-full flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Solicitudes por numero de intentos</h3>
            <span className="opacity-50">
              Numero de solicitudes por estudiante
            </span>
            <ChartContainer config={{}} className="mx-auto w-full min-h-[80px]">
              <PieChart margin={{ top: 15 }}>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={solicitudesPorIntentos}
                  dataKey="count"
                  nameKey="status"
                  label={({ count, percent }) =>
                    `${count} (${(percent * 100).toFixed(0)}%)`
                  }
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ChartContainer>
          </Card>
          <Card className="w-full flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Tipos de solicitudes</h3>
            <span className="opacity-50">
              Distribucion de solicitudes por tipo
            </span>
            <ChartContainer config={{}} className="mx-auto w-full min-h-[80px]">
              <PieChart margin={{ top: 15 }}>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={solicitudesPorTipo}
                  dataKey="count"
                  nameKey="status"
                  label={({ count, percent }) =>
                    `${count} (${(percent * 100).toFixed(0)}%)`
                  }
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ChartContainer>
          </Card>
        </div>
        <div className="flex flex-col md:flex-row w-full justify-between gap-y-2 gap-x-6">
          <Card className="w-full flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Solicitudes por franja horaria</h3>
            <div className="flex flex-col md:flex-row gap-4 w-full justify-between items-center">
              {
                //mostramos el conteo de solicitudes por franja horaria
                daysAndShifts.map(({ day, label }) => (
                  <Card key={day} className="w-full">
                    <CardHeader className="text-center !py-2 md:!py-4">
                      <CardTitle>{label}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-y-2">
                      {franjasTotales
                        .filter((franja) => franja.day === day)
                        .map((franja) => {
                          const franjaData = solicitudesPorFranja.find(
                            (f) => f.status === franja.label
                          );
                          return (
                            <div
                              key={franja.label}
                              className="flex justify-between items-center bg-template rounded-md px-4 py-2"
                            >
                              {franja.time == "AM" ? <Sun /> : <Moon />}
                              <span>{franja.time}</span>
                              <span>{franjaData?.count || 0}</span>
                            </div>
                          );
                        })}
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
