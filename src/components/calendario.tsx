import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Textarea } from "./ui/textarea";
import { Materia } from "@/types/materiaTypes";
import { Solicitud } from "@/types/solicitudesTypes";
import { Trash2, Send, X, PlusCircle, MinusCircle, Repeat } from "lucide-react";

interface CalendarioProps {
  horario: Materia[];
  handleRemoveMateria: (
    materiaSku: string,
    groupSku?: string,
    isInicial?: boolean
  ) => void;
  handleSave?: () => void;
  horarioInicial?: Materia[];
  solicitudes?: Solicitud["requests"];
  modalOpen?: boolean;
  setAsk?: (ask: string) => void;
}

export default function Calendario({
  horario,
  handleRemoveMateria,
  handleSave,
  horarioInicial = [],
  solicitudes,
  modalOpen,
  setAsk,
}: CalendarioProps) {
  const timeSlots = [
    "6-7",
    "7-8",
    "8-9",
    "9-10",
    "10-11",
    "11-12",
    "12-13",
    "13-14",
    "14-15",
    "15-16",
    "16-17",
    "17-18",
    "18-19",
    "19-20",
    "20-21",
    "21-22",
  ];
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setIsDialogOpen(!modalOpen || false);
  }, [modalOpen]);

  const getClassForCell = (materiaSku: string, group?: string) => {
    const colorClasses = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
    ];

    const grupos =
      horario
        .find((m) => m.sku === materiaSku)
        ?.groups?.map((group) => group.sku).length || 0;
    const isInicial = horarioInicial.find((m) => m.groups[0]?.sku === group);
    const isInicialDeleted =
      horario.find((m) => m.groups.find((g) => g.sku === group)) === undefined;

    // REVISAR ESTEBAN
    if (isInicialDeleted) {
      // Materia inicial eliminada
      return "border-2 border-red-500 text-red-500 line-through opacity-40";
    } else if (isInicial && grupos <= 1) {
      // Materia inicial por defecto
      return "bg-gray-500 text-white";
    } else if (isInicial && grupos > 1) {
      // Cambio de grupo de materia inicial
      return "border-2 border-primary text-primary opacity-40";
    }
    const index = horario.findIndex((m) => m.sku === materiaSku);
    return `${colorClasses[index % colorClasses.length]} text-white`;
  };

  function getDurationInHours(startHour: number, endHour: number): number {
    return endHour - startHour;
  }

  function parseTimeRange(hora: string): { start: number; end: number } {
    const [start, end] = hora.split("-").map((time) => {
      const [hours] = time.split(":").map(Number);
      return hours;
    });
    return { start, end };
  }

  function matchDayAndTime(
    dia: string,
    timeSlot: string,
    schedule: Materia["groups"][0]["schedule"]
  ): { matches: boolean; duration?: number } {
    const dayMap: Record<string, string> = {
      LUNES: "Lunes",
      MARTES: "Martes",
      MIERCOLES: "Miércoles",
      JUEVES: "Jueves",
      VIERNES: "Viernes",
      SABADO: "Sábado",
    };

    const [slotStart] = timeSlot.split("-").map(Number);

    if (!schedule) return { matches: false };
    for (const { day, time } of schedule) {
      if (dayMap[day.toUpperCase()] !== dia) continue;

      const { start: scheduleStart, end: scheduleEnd } = parseTimeRange(time);

      if (slotStart === scheduleStart) {
        return {
          matches: true,
          duration: getDurationInHours(scheduleStart, scheduleEnd),
        };
      }
    }

    return { matches: false };
  }

  const renderedSlots: Record<string, Set<string>> = {};

  function renderCell(day: string, time: string) {
    if (!renderedSlots[day]) {
      renderedSlots[day] = new Set();
    }

    const materiasEnHorario: Array<{
      materia: Materia;
      group: Materia["groups"][0];
      duration: number;
    }> = [];

    const combinedHorario = horario.concat(horarioInicial);

    combinedHorario.forEach((materia) => {
      materia.groups.forEach((group) => {
        const { matches, duration } = matchDayAndTime(
          day,
          time,
          group.schedule
        );
        if (matches && duration) {
          materiasEnHorario.push({ materia, group, duration });
        }
      });
    });

    return materiasEnHorario
      .map(({ materia, group, duration }) => {
        const cellKey = `${materia.sku}-${group.sku}-${day}`;

        if (renderedSlots[day].has(cellKey)) {
          return null;
        }

        renderedSlots[day].add(cellKey);
        const slotHeight = duration * 36; // 36px por hora

        const grupos =
          horario
            .find((m) => m.sku === materia.sku)
            ?.groups?.map((group) => group.sku).length || 0;
        const isInicial =
          horarioInicial.find((m) => m.groups[0]?.sku === group.sku) !==
          undefined;
        const isInicialDeleted =
          horario.find((m) => m.groups.find((g) => g.sku === group.sku)) ===
          undefined;

        return (
          <div
            key={cellKey}
            className={`${getClassForCell(
              materia.sku,
              group.sku
            )} mx-0.5 px-1 py-0.5 rounded-md 
            overflow-hidden flex items-center relative`}
            style={{
              height: `${slotHeight}px`,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <div className="flex-grow overflow-hidden">
              <p className="font-medium text-[0.6rem] md:text-xs leading-tight">
                {materia.name}
                <br />
                <span className="text-[0.5rem] md:text-xs opacity-75">
                  Grupo {group.sku}
                </span>
              </p>
            </div>
            {(!isInicial || (isInicial && grupos <= 1) || isInicialDeleted) && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 !p-0.5 !h-5 !w-5 z-20"
                onClick={() => {
                  handleRemoveMateria(
                    materia.sku,
                    group.sku,
                    isInicial && isInicialDeleted
                  );
                }}
              >
                {isInicialDeleted ? (
                  <X className="h-3 w-3" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        );
      })
      .filter(Boolean);
  }

  return (
    <Card className="w-full overflow-x-auto">
      <CardContent className="!p-0">
        <div className="min-w-[600px]">
          {/* Ensures horizontal scrolling on small screens */}
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-6 md:w-14 text-xs md:text-sm">
                  Hora
                </TableHead>
                {days.map((day) => (
                  <TableHead
                    key={day}
                    className="w-14 md:w-1/6 text-center text-xs md:text-sm"
                  >
                    {day}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeSlots.map((time) => (
                <TableRow key={time}>
                  <TableCell className="font-medium md:w-14 text-center text-[8px] md:text-sm">
                    {time}
                  </TableCell>
                  {days.map((day) => (
                    <TableCell
                      key={`${day}-${time}`}
                      className="w-1/6 p-0.5 relative h-9"
                    >
                      {renderCell(day, time)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-2 md:mt-4 px-2">
          <AlertDialog
            open={isDialogOpen}
            onOpenChange={(isOpen) => setIsDialogOpen(isOpen)}
          >
            <AlertDialogTrigger className="w-full" asChild>
              <Button className="w-[600px] md:w-full text-xs md:text-base">
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base md:text-xl">
                  Resumen de movimientos
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs md:text-sm">
                  {horarioInicial.length > 0 ? (
                    <div className="flex flex-col gap-y-1 md:gap-y-2 mb-2 md:mb-4">
                      {solicitudes &&
                        solicitudes?.length > 0 &&
                        solicitudes.map((solicitud) =>
                          solicitud.from && !solicitud.to ? (
                            <div
                              key={solicitud.from.sku}
                              className="flex gap-1 md:gap-2 text-xs md:text-lg items-center justify-between bg-template px-1 md:px-2 py-0.5 md:py-1 rounded-md"
                            >
                              <div className="flex gap-1 md:gap-2 items-center">
                                <MinusCircle
                                  size={16}
                                  className="text-red-500"
                                />
                                <p className="text-xs md:text-base">
                                  Eliminada: {solicitud.from.name} (
                                  {solicitud.from.group})
                                </p>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="!h-6 !w-6"
                                onClick={() => {
                                  if (solicitud.from) {
                                    handleRemoveMateria(
                                      solicitud.from.sku,
                                      solicitud.from.group,
                                      true
                                    );
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : solicitud.to && !solicitud.from ? (
                            <div
                              key={solicitud.to[0].sku}
                              className="flex gap-1 md:gap-2 text-xs md:text-lg items-center justify-between bg-template px-1 md:px-2 py-0.5 md:py-1 rounded-md"
                            >
                              <div className="flex gap-1 md:gap-2 items-center">
                                <PlusCircle
                                  size={16}
                                  className="text-green-500"
                                />
                                <p className="text-xs md:text-base">
                                  Añadida: {solicitud.to[0].name} (
                                  {solicitud.to.map((m) => m.group).join(", ")})
                                </p>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="!h-6 !w-6"
                                onClick={() => {
                                  if (solicitud.to) {
                                    handleRemoveMateria(
                                      solicitud.to[0].sku,
                                      solicitud.to[0].group,
                                      false
                                    );
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            solicitud.to &&
                            solicitud.from && (
                              <div
                                key={solicitud.from.sku}
                                className="flex gap-1 md:gap-2 text-xs md:text-lg items-center justify-between bg-template px-1 md:px-2 py-0.5 md:py-1 rounded-md"
                              >
                                <div className="flex gap-1 md:gap-2 items-center">
                                  <Repeat size={16} className="text-blue-500" />
                                  <p className="text-xs md:text-base">
                                    Cambio de grupo: {solicitud.from.name} (
                                    {solicitud.from.group}) a (
                                    {solicitud.to
                                      .map((m) => m.group)
                                      .join(", ")}
                                    )
                                  </p>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="!h-6 !w-6"
                                  onClick={() => {
                                    if (solicitud.from && solicitud.to) {
                                      handleRemoveMateria(
                                        solicitud.from.sku,
                                        solicitud.to[solicitud.to.length - 1]
                                          .group,
                                        false
                                      );
                                    }
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )
                        )}
                      {setAsk && (
                        <Textarea
                          className="w-full mt-4"
                          onChange={(e) => setAsk(e.target.value)}
                          placeholder="Ingrese indicaciones adicionales para el administrador."
                        />
                      )}
                    </div>
                  ) : (
                    horario.length > 0 && (
                      <div>
                        <h3 className="font-medium text-sm md:text-xl">
                          Horario modificado
                        </h3>
                        <ul className="flex flex-col gap-y-1 md:gap-y-2 my-2 md:my-4">
                          {horario.map((materia) => (
                            <li key={materia.sku}>
                              <div className="flex gap-1 md:gap-2 text-xs md:text-lg items-center justify-between bg-template px-1 md:px-2 py-0.5 md:py-1 rounded-md">
                                <p className="text-xs md:text-base">
                                  {materia.sku} -{" "}
                                  <span className="font-semibold">
                                    {materia.name}
                                  </span>{" "}
                                  en grupo{" "}
                                  <span className="font-semibold">
                                    {materia.groups[0].sku}
                                  </span>
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="!h-6 !w-6"
                                  onClick={() =>
                                    handleRemoveMateria(materia.sku)
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                  ¿Estás seguro de que deseas enviar la solicitud?, Hasta no
                  aprobarse esta no podras enviar mas solicitudes, debes crear
                  todas las peticiones en una misma solicitud. Por favor, revisa
                  el resumen de los movimientos realizados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-xs md:text-base">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleSave && handleSave()}
                  className="text-xs md:text-base"
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
