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
import { Materia } from "@/types/materiaTypes";
import { Trash2, Save, X } from "lucide-react";

interface CalendarioProps {
  horario: Materia[];
  handleRemoveMateria: (
    materiaId: string,
    groupSku?: string,
    isInicial?: boolean
  ) => void;
  handleSave?: () => void;
}

export default function Calendario({
  horario,
  handleRemoveMateria,
  handleSave,
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

  const [horarioInicial, setHorarioInicial] = useState<Materia[]>([]);

  useEffect(() => {
    setHorarioInicial(horario);
  }, []);

  const getClassForCell = (materiaId: string, group?: string) => {
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
        .find((m) => m._id === materiaId)
        ?.groups?.map((group) => group.sku).length || 0;
    const isInicial = horarioInicial.find((m) => m.groups[0]?.sku === group);
    const isInicialDeleted =
      horario.find((m) => m.groups.find((g) => g.sku === group)) === undefined;

    if (isInicialDeleted) {
      return "border-2 border-red-500 text-red-500 line-through opacity-40";
    } else if (isInicial && grupos <= 1) {
      return "bg-gray-500 text-white";
    } else if (isInicial && grupos > 1) {
      return "border-2 border-primary text-primary opacity-40";
    }
    const index = horario.findIndex((m) => m._id === materiaId);
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
    day: string,
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

    for (const { dia, hora } of schedule) {
      if (dayMap[dia.toUpperCase()] !== day) continue;

      const { start: scheduleStart, end: scheduleEnd } = parseTimeRange(hora);

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
        const cellKey = `${materia._id}-${group.sku}-${day}`;

        if (renderedSlots[day].has(cellKey)) {
          return null;
        }

        renderedSlots[day].add(cellKey);
        const slotHeight = duration * 36; // 36px por hora

        const grupos =
          horario
            .find((m) => m._id === materia._id)
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
              materia._id,
              group.sku
            )} mx-1 px-2 py-1 rounded-md 
            overflow-x-clip flex justify-between items-center`}
            style={{
              height: `${slotHeight}px`,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <p className="font-medium text-xs">
              {materia.name}
              <br />
              <span className="text-xs opacity-75">Grupo {group.sku}</span>
            </p>
            {(!isInicial || (isInicial && grupos <= 1) || isInicialDeleted) && (
              <Button
                variant="ghost"
                size="sm"
                className="!p-1 !h-fit"
                onClick={() => {
                  handleRemoveMateria(
                    materia._id,
                    group.sku,
                    isInicial && isInicialDeleted
                  );
                }}
              >
                {isInicialDeleted ? <X /> : <Trash2 />}
              </Button>
            )}
          </div>
        );
      })
      .filter(Boolean);
  }

  return (
    <Card>
      <CardContent className="!p-0">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Hora</TableHead>
              {days.map((day) => (
                <TableHead key={day} className="w-1/6 text-center">
                  {day}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlots.map((time) => (
              <TableRow key={time}>
                <TableCell className="font-medium w-14 text-center">
                  {time}
                </TableCell>
                {days.map((day) => (
                  <TableCell
                    key={`${day}-${time}`}
                    className="w-1/6 p-1 relative h-9"
                  >
                    {renderCell(day, time)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4">
          <Button
            className="w-full"
            onClick={() => handleSave && handleSave()}
          >
            <Save />
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
