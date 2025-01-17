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
import { Trash2, Save } from "lucide-react";

interface CalendarioProps {
  horario: Materia[];
  setHorario: (horario: Materia[]) => void;
  handleSaveSchedule: () => void;
}

export default function Calendario({
  horario,
  setHorario,
  handleSaveSchedule,
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

  // Función para obtener la clase de color de una celda
  const getClassForCell = (materiaId: string) => {
    const colorClasses = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
    ];

    const index = horario.findIndex((m) => m._id === materiaId);
    return `${colorClasses[index % colorClasses.length]} text-white`;
  };

  // Función para obtener el rango de horas de una materia
  function getTimeRangeFromSchedule(
    schedule: Materia["groups"][0]["schedule"]
  ) {
    const allHours = schedule.map((s) => {
      const [start, end] = s.hora
        .split("-")
        .map((t) => parseInt(t.trim().split(":")[0], 10));
      return { start, end };
    });

    return {
      start: Math.min(...allHours.map((h) => h.start)),
      end: Math.max(...allHours.map((h) => h.end)),
    };
  }

  // Función para verificar si una materia coincide con un día y hora
  function matchDayAndTime(
    day: string,
    time: string,
    schedule: Materia["groups"][0]["schedule"]
  ): boolean {
    const dayMap: { [key: string]: string } = {
      LUNES: "Lunes",
      MARTES: "Martes",
      MIERCOLES: "Miércoles",
      JUEVES: "Jueves",
      VIERNES: "Viernes",
      SABADO: "Sábado",
    };

    const [startHour, endHour] = time
      .split("-")
      .map((t) => parseInt(t.trim(), 10));

    return schedule.some((s) => {
      const [scheduleStart, scheduleEnd] = s.hora
        .split("-")
        .map((t) => parseInt(t.trim().split(":")[0], 10));
      const dayMatch = dayMap[s.dia.toUpperCase()] === day;
      const timeMatch = startHour >= scheduleStart && endHour <= scheduleEnd;
      return dayMatch && timeMatch;
    });
  }

  // Estructura para mantener registro de las materias ya renderizadas
  const renderedSlots: Record<string, Set<string>> = {};

  function renderCell(day: string, time: string) {
    // Inicializar el conjunto para este día si no existe
    if (!renderedSlots[day]) {
      renderedSlots[day] = new Set();
    }

    const materiasEnHorario: Array<{
      materia: Materia;
      group: Materia["groups"][0];
      timeRange: { start: number; end: number };
    }> = [];

    // Recolectar todas las materias que coinciden con este horario
    horario.forEach((materia) => {
      materia.groups.forEach((group) => {
        if (matchDayAndTime(day, time, group.schedule)) {
          const timeRange = getTimeRangeFromSchedule(group.schedule);
          materiasEnHorario.push({ materia, group, timeRange });
        }
      });
    });

    return materiasEnHorario
      .map(({ materia, group, timeRange }) => {
        const [currentHour] = time.split("-").map((t) => parseInt(t));
        const cellKey = `${materia._id}-${group.sku}-${day}`;

        // Si no es la primera hora de la materia, no renderizar
        if (
          currentHour !== timeRange.start ||
          renderedSlots[day].has(cellKey)
        ) {
          return null;
        }

        // Marcar esta materia como renderizada
        renderedSlots[day].add(cellKey);

        const slotHeight = (timeRange.end - timeRange.start) * 36; // 48px por hora

        return (
          <div
            key={cellKey}
            className={`${getClassForCell(
              materia._id
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
            <Button
              variant="ghost"
              size="sm"
              className="!p-1 !h-fit"
              onClick={() => {
                const newHorario = horario.filter((m) => m._id !== materia._id);
                setHorario(newHorario);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
                    className="w-1/6 p-1 relative h-6"
                  >
                    {renderCell(day, time)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4">
          <Button className="w-full" onClick={() => handleSaveSchedule()}>
            <Save />
            Guardar horario
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
