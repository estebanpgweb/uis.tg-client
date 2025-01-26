import { useState, FormEvent } from "react";
import { Materia, getMateriaNameBySku } from "@/types/materiaTypes";
import { Card, CardContent, CardTitle, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "./ui/label";
import { Plus, X } from "lucide-react";

interface MateriasProps {
  materias: Materia[];
  onGroupSelect: (materia: Materia, group: Materia["groups"][0]) => void;
  isGroupSelected: (materiaSku: string, groupSku: string) => boolean;
}

export default function Materias({
  materias,
  onGroupSelect,
  isGroupSelected,
}: MateriasProps) {
  const [filterInput, setFilterInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const emptyMateria = {
    name: "",
    sku: "",
    groups: [
      {
        sku: "",
      },
    ],
  };
  const [materiaNoRegistrada, setMateriaNoRegistrada] =
    useState<Materia>(emptyMateria);

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

  const handleSaveMateriaNoRegistrada = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !materiaNoRegistrada.name ||
      !materiaNoRegistrada.sku ||
      !materiaNoRegistrada.groups[0].sku
    ) {
      return;
    }

    //verificar que no exista la materia en la lista de materias
    const materiaExistente = materias.find(
      (m) => m.sku === materiaNoRegistrada.sku && m.groups.length > 0
    );

    if (materiaExistente) {
      toast({
        variant: "destructive",
        title: "Materia existente",
        description: `La materia ${materiaExistente.sku} - ${materiaExistente?.name} ya se encuentra registrada en el sistema.`,
      });
      return;
    }

    onGroupSelect(materiaNoRegistrada, materiaNoRegistrada.groups[0]);
    setMateriaNoRegistrada(emptyMateria);
    setDialogOpen(false);
  };

  return (
    <Card className="h-full">
      <CardHeader className="!pb-2 !px-2">
        <CardTitle className="pb-2">Asignaturas disponibles</CardTitle>
        <div className="flex items-center justify-between gap-x-2">
          <Input
            type="search"
            placeholder="Buscar asignatura"
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  <Plus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Agregar asignatura no existente.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Modal materia no registrada */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ingresar asignatura no encontrada</DialogTitle>
                <DialogDescription>
                  Registre a continuación los datos de la asignatura que no se
                  encuentra en el sistema.
                  <form
                    className="flex flex-col gap-4 mt-4"
                    onSubmit={handleSaveMateriaNoRegistrada}
                  >
                    <div className="flex flex-col gap-2">
                      <Label className="font-normal" htmlFor="name">
                        Nombre de la asignatura
                      </Label>
                      <Input
                        required
                        id="name"
                        autoComplete="name"
                        type="text"
                        value={materiaNoRegistrada.name}
                        onChange={(e) =>
                          setMateriaNoRegistrada({
                            ...materiaNoRegistrada,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="font-normal" htmlFor="sku">
                        Codigo de la asignatura
                      </Label>
                      <Input
                        required
                        id="sku"
                        autoComplete="sku"
                        type="number"
                        value={materiaNoRegistrada.sku}
                        onChange={(e) =>
                          setMateriaNoRegistrada({
                            ...materiaNoRegistrada,
                            sku: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="font-normal" htmlFor="group">
                        Grupo de la asignatura
                      </Label>
                      <Input
                        required
                        id="group"
                        autoComplete="group"
                        type="text"
                        value={materiaNoRegistrada.groups[0].sku}
                        onChange={(e) =>
                          setMateriaNoRegistrada({
                            ...materiaNoRegistrada,
                            groups: [
                              {
                                ...materiaNoRegistrada.groups[0],
                                sku: e.target.value,
                              },
                            ],
                          })
                        }
                      />
                    </div>
                    <Button type="submit">
                      <Plus />
                      Agregar
                    </Button>
                  </form>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
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
                  <div>
                    <p className="text-sm opacity-50">
                      <span className="font-semibold">Créditos:</span>{" "}
                      {materia.credits}
                    </p>
                    <p className="text-sm opacity-50">
                      <span className="font-semibold">Nivel:</span>{" "}
                      {materia.level}
                    </p>
                    {materia.requirements &&
                      materia.requirements.length > 0 && (
                        <p className="text-sm opacity-50">
                          <span className="font-semibold">Requisitos:</span>{" "}
                          {getMateriaNameBySku(materias, materia.requirements)}
                        </p>
                      )}
                  </div>
                  <div className="px-2">
                    {materia.groups && materia.groups?.length > 0 ? (
                      materia.groups?.map((group) => {
                        const isSelected = isGroupSelected(
                          materia.sku,
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
                              <div className="text-xs opacity-50 px-2">
                                <ul className="flex flex-col gap-y-1 list-disc list-inside">
                                  {group.schedule?.map((s, idx) => (
                                    <li key={idx}>
                                      {s.day}, {s.time}
                                      <br />
                                      <span className="text-xs font-thin">
                                        {s.professor
                                          ? `${s.professor}`
                                          : "No registrado"}
                                      </span>
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
                      <p className="opacity-50 text-sm">
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
