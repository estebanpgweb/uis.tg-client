import { useState, useEffect } from "react";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import {
  Pie,
  PieChart,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Sun, Moon } from "lucide-react";
import {
  getStatusLabel,
  Solicitud,
  convertToColombianTime,
  getShiftDate,
  dayType,
} from "@/types/solicitudesTypes";
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
    fill?: string;
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
  const [horaCreacionSolicitud, setHoraCreacionSolicitud] = useState<
    solicitudesChart[]
  >([]);

  const axios: AxiosInstance = useAxios();
  const { toast } = useToast();

  const franjasTotales: { day: dayType; time: "AM" | "PM"; label: string }[] = [
    { day: "MONDAY", time: "AM", label: "Extemporánea" },
    { day: "WEDNESDAY", time: "AM", label: "Mie AM" },
    { day: "WEDNESDAY", time: "PM", label: "Mie PM" },
    { day: "THURSDAY", time: "AM", label: "Jue AM" },
    { day: "THURSDAY", time: "PM", label: "Jue PM" },
    { day: "FRIDAY", time: "AM", label: "Vie AM" },
    { day: "FRIDAY", time: "PM", label: "Vie PM" },
  ];

  const horasTotales = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "22",
    "23",
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

    const conteoPorFranjasTotales: solicitudesChart[] = franjasTotales.map(
      (franja, index) => {
        // Fechas de referencia para cada franja
        let fechaInicioFranja, fechaFinFranja;

        if (franja.day === "MONDAY" && franja.time === "AM") {
          // Para la franja extemporánea, usamos una fecha posterior al viernes
          const fechaViernes = new Date(
            getShiftDate({ day: "FRIDAY", time: "PM" })
          );
          fechaInicioFranja = new Date(fechaViernes);
          fechaInicioFranja.setDate(fechaInicioFranja.getDate() + 1); // Día después del viernes
          fechaFinFranja = new Date(2099, 11, 31); // Fecha muy lejana en el futuro
        } else {
          fechaInicioFranja = new Date(
            getShiftDate({ day: franja.day, time: franja.time })
          );
          fechaFinFranja = new Date(fechaInicioFranja);

          // Si es AM, el fin es a las 12:00, si es PM, el fin es a las 24:00
          if (franja.time === "AM") {
            fechaFinFranja.setHours(12, 0, 0, 0);
          } else {
            fechaFinFranja.setHours(24, 0, 0, 0);
          }
        }

        // Para la siguiente franja (excepto para extemporánea y viernes PM)
        let fechaInicioSiguienteFranja;
        if (franja.day === "MONDAY" && franja.time === "AM") {
          fechaInicioSiguienteFranja = fechaFinFranja; // No se usa para extemporánea
        } else if (franja.day === "WEDNESDAY" && franja.time === "AM") {
          fechaInicioSiguienteFranja = new Date(
            getShiftDate({ day: "WEDNESDAY", time: "PM" })
          );
        } else if (franja.day === "WEDNESDAY" && franja.time === "PM") {
          fechaInicioSiguienteFranja = new Date(
            getShiftDate({ day: "THURSDAY", time: "AM" })
          );
        } else if (franja.day === "THURSDAY" && franja.time === "AM") {
          fechaInicioSiguienteFranja = new Date(
            getShiftDate({ day: "THURSDAY", time: "PM" })
          );
        } else if (franja.day === "THURSDAY" && franja.time === "PM") {
          fechaInicioSiguienteFranja = new Date(
            getShiftDate({ day: "FRIDAY", time: "AM" })
          );
        } else if (franja.day === "FRIDAY" && franja.time === "AM") {
          fechaInicioSiguienteFranja = new Date(
            getShiftDate({ day: "FRIDAY", time: "PM" })
          );
        } else {
          // Para viernes PM
          fechaInicioSiguienteFranja = new Date(fechaFinFranja);
          fechaInicioSiguienteFranja.setDate(
            fechaInicioSiguienteFranja.getDate() + 1
          );
        }

        const solicitudesFranja = solicitudesAtendidas.filter((solicitud) => {
          if (!solicitud.updatedAt || !solicitud.createdAt) return false;

          const fechaUpdate = new Date(solicitud.updatedAt);
          const fechaMiercoles = new Date(
            getShiftDate({ day: "WEDNESDAY", time: "AM" })
          );
          const fechaViernes = new Date(
            getShiftDate({ day: "FRIDAY", time: "PM" })
          );
          const fechaSabado = new Date(fechaViernes);
          fechaSabado.setDate(fechaSabado.getDate() + 1);

          // Caso especial: solicitudes extemporáneas (después del viernes)
          if (franja.day === "MONDAY" && franja.time === "AM") {
            return fechaUpdate >= fechaSabado;
          }

          // Caso especial: solicitudes anteriores al miércoles
          if (
            franja.day === "WEDNESDAY" &&
            franja.time === "AM" &&
            fechaUpdate < fechaMiercoles
          ) {
            return true;
          }

          // Caso normal: solicitud dentro de su franja correspondiente
          return (
            fechaUpdate >= fechaInicioFranja &&
            fechaUpdate < fechaInicioSiguienteFranja
          );
        });

        const tiempoTotal = solicitudesFranja.reduce((acc, solicitud) => {
          if (!solicitud.createdAt || !solicitud.updatedAt) {
            return acc;
          }

          const createdAt = new Date(solicitud.createdAt);
          const updatedAt = new Date(solicitud.updatedAt);

          // Si la solicitud se creó antes del inicio de la franja
          if (createdAt < fechaInicioFranja) {
            return acc + (updatedAt.getTime() - fechaInicioFranja.getTime());
          } else {
            return acc + (updatedAt.getTime() - createdAt.getTime());
          }
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
    
    // calculamos el total de solicitudes por franja según updatedAt
    const conteoPorFranjas: solicitudesChart[] = franjasTotales.map(
      (franja, index) => {
        const solicitudesFranja = solicitudesAtendidas.filter((solicitud) => {
          if (!solicitud.updatedAt) return false;

          // Fechas de referencia para cada día de la semana
          const fechaMiercoles = new Date(
            getShiftDate({ day: "WEDNESDAY", time: "AM" })
          );
          const fechaJueves = new Date(
            getShiftDate({ day: "THURSDAY", time: "AM" })
          );
          const fechaViernes = new Date(
            getShiftDate({ day: "FRIDAY", time: "AM" })
          );
          const fechaSabado = new Date(fechaViernes);
          fechaSabado.setDate(fechaSabado.getDate() + 1);

          const fechaUpdate = new Date(solicitud.updatedAt);
          // Determinar el día
          let dia: dayType;
          if (fechaUpdate < fechaMiercoles) {
            // Antes del miércoles, asignar a miércoles AM
            return franja.day === "WEDNESDAY" && franja.time === "AM";
          } else if (fechaUpdate < fechaJueves) {
            dia = "WEDNESDAY";
          } else if (fechaUpdate < fechaViernes) {
            dia = "THURSDAY";
          } else if (fechaUpdate < fechaSabado) {
            dia = "FRIDAY";
          } else {
            dia = "MONDAY";
          }

          // Determinar AM o PM usando la función convertToColombianTime
          const hora = convertToColombianTime(solicitud.updatedAt);
          const turno = hora >= 14 && dia != "MONDAY" ? "PM" : "AM";

          return franja.day === dia && franja.time === turno;
        });

        return {
          status: franja.label,
          count: solicitudesFranja.length,
          fill: `hsl(var(--chart-${index + 1}))`,
        };
      }
    );

    setSolicitudesPorFranja(conteoPorFranjas);

    // Función para determinar en qué franja horaria cae una hora

    // Función principal para procesar las solicitudes
    const calculateTimeSlots = (
      solicitudes: Solicitud[]
    ): solicitudesChart[] => {
      // Inicializar conteo por franjas
      const conteo = horasTotales.map((hora) => ({
        status: hora,
        count: 0,
      }));

      // Procesar cada solicitud
      solicitudes.forEach((solicitud) => {
        if (solicitud.createdAt) {
          const colombianHour = convertToColombianTime(solicitud.createdAt);
          // Convertir la hora a string para hacer match exacto
          const timeSlot = colombianHour.toString();
          const slotIndex = horasTotales.findIndex((slot) => slot === timeSlot);

          if (slotIndex !== -1) {
            conteo[slotIndex].count++;
          }
        }
      });

      return conteo;
    };

    const conteoPorHoras = calculateTimeSlots(solicitudes);
    setHoraCreacionSolicitud(conteoPorHoras);
  }, [solicitudes, franjasTotales]);

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
              {(solicitudesAtendidas.length === 0
                ? 0
                : solicitudesAtendidas.reduce((acc, solicitud) => {
                    if (
                      !solicitud.createdAt ||
                      !solicitud.updatedAt ||
                      !solicitud.student?.shift
                    ) {
                      return acc; // Omitimos si falta algún dato necesario
                    }

                    const shiftDate = new Date(
                      getShiftDate(solicitud.student.shift)
                    ); // Fecha esperada del shift
                    const createdAt = new Date(solicitud.createdAt);
                    const updatedAt = new Date(solicitud.updatedAt);

                    // Solo consideramos solicitudes creadas el mismo día o después del turno
                    if (createdAt.getTime() >= shiftDate.getTime()) {
                      return acc + (updatedAt.getTime() - createdAt.getTime());
                    } else {
                      return acc + (updatedAt.getTime() - shiftDate.getTime());
                    }
                  }, 0) /
                  solicitudesAtendidas.length /
                  1000 /
                  60 /
                  60
              ).toFixed(1) + " h"}
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
          <Card className="w-full flex flex-col gap-y-2 flex-1 py-2 md:px-6 md:py-4">
            <h3>Tráfico de creación de solicitudes</h3>
            <ChartContainer config={{}} className="w-full min-h-[80px] h-80">
              <AreaChart data={horaCreacionSolicitud}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="status" tickMargin={8} />
                <YAxis tickLine={false} tickMargin={8} />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-template p-2 border rounded shadow">
                          <p className="text-primary">
                            Hora: {payload[0].payload.status}:00
                          </p>
                          <p className="text-primary">
                            Solicitudes: {payload[0].payload.count}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  dataKey="count"
                  type="monotone"
                  fill="hsl(var(--chart-1))"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
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
          <div className="flex flex-col md:flex-row w-full justify-between gap-y-2 gap-x-6">
            <Card className="w-full flex flex-col gap-y-2 flex-1 py-2 md:px-6 md:py-4">
              <h3>Solicitudes completadas por franja horaria del estudiante</h3>
              <span className="opacity-50">Solicitudes por franja horaria</span>
              <ChartContainer
                config={{}}
                className="mx-auto w-full min-h-[80px] h-80"
              >
                <BarChart data={solicitudesPorFranja} margin={{ top: 15 }}>
                  <CartesianGrid strokeDasharray="2 2" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <ChartTooltip
                    content={({ payload }) => {
                      if (payload && payload[0]) {
                        return (
                          <div className="bg-background border p-2 rounded-md">
                            <p>{payload[0].payload.status}</p>
                            <p className="font-semibold">{payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ChartContainer>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
