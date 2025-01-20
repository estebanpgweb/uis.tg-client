import { useState } from "react";
import { Materia } from "@/types/materiaTypes";
import { Card, CardContent, CardTitle, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, X } from "lucide-react";

interface MateriasProps {
  materias: Materia[];
  onGroupSelect: (materia: Materia, group: Materia["groups"][0]) => void;
  isGroupSelected: (materiaId: string, groupSku: string) => boolean;
}

export default function Materias({
  materias,
  onGroupSelect,
  isGroupSelected,
}: MateriasProps) {
  const [filterInput, setFilterInput] = useState("");

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "");
  };

  const filteredMaterias = materias.filter((materia) => {
    const searchTerm = normalizeText(filterInput);
    const name = normalizeText(materia.name);
    const codigo = normalizeText(materia.sku);

    return name.includes(searchTerm) || codigo.includes(searchTerm);
  });

  return (
    <Card className="h-full">
      <CardHeader className="!pb-2 !px-2">
        <CardTitle className="pb-2">Asignaturas disponibles</CardTitle>
        <Input
          type="search"
          placeholder="Buscar asignatura"
          value={filterInput}
          onChange={(e) => setFilterInput(e.target.value)}
        />
      </CardHeader>
      <CardContent className="!pr-0 !pl-3">
        <ScrollArea className="flex flex-col h-[calc(100vh-11.5rem)] gap-y-4 pr-3">
          <Accordion type="single" collapsible className="w-full">
            {filteredMaterias.map((materia) => (
              <AccordionItem
                key={materia._id}
                value={materia._id || materia.name}
                className="border-none"
              >
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex flex-col w-full">
                    <div className="flex w-full items-center justify-between">
                      <h3 className="font-medium text-left">{materia.name}</h3>
                    </div>
                    <Separator className="mt-2" />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-2">
                    {materia.groups && materia.groups?.length > 0 ? (
                      materia.groups?.map((group) => {
                        const isSelected = isGroupSelected(
                          materia._id,
                          group.sku
                        );
                        return (
                          <Card
                            key={group.sku}
                            className={`flex justify-between items-center my-2 p-2 ${
                              isSelected ? "border-primary" : ""
                            }`}
                          >
                            <div>
                              <span className="font-medium">
                                Grupo {group.sku}
                              </span>
                              <div className="text-xs text-gray-500 px-2">
                                <ul className="list-disc list-inside">
                                  {group.schedule.map((s, idx) => (
                                    <li key={idx}>
                                      {s.day}, {s.time}
                                      {s.building &&
                                        s.room &&
                                        ` (${s.building} - ${s.room})`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <Button
                              variant={isSelected ? "destructive" : "default"}
                              size="sm"
                              onClick={() => onGroupSelect(materia, group)}
                            >
                              {isSelected ? <X /> : <Plus />}
                            </Button>
                          </Card>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No hay grupos disponibles
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
