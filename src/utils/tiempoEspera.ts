const SolicitudTiempoEspera = ({
  createdAt,
  updatedAt,
}: {
  createdAt: string;
  updatedAt: string;
}) => {
  const calcularTiempoTranscurrido = (
    fechaInicial: string,
    fechaFinal: string
  ) => {
    const ahora = new Date();
    const fecha = new Date(fechaInicial);
    const fechaActualizacion = new Date(fechaFinal);

    // Usamos una función auxiliar para comparar fechas ignorando milisegundos
    const sonFechasIguales = (fecha1: Date, fecha2: Date) => {
      return Math.abs(fecha1.getTime() - fecha2.getTime()) < 60000; // Tolerancia de 60 segundos
    };

    if (sonFechasIguales(fechaActualizacion, fecha)) {
      const diferencia = ahora.getTime() - fecha.getTime();

      const segundos = Math.floor(diferencia / 1000);
      const minutos = Math.floor(segundos / 60);
      const horas = Math.floor(minutos / 60);
      const días = Math.floor(horas / 24);

      if (días > 0) return `${días}d ${horas % 24}h`;
      if (horas > 0) return `${horas}h ${minutos % 60}m`;
      if (minutos > 0) return `${minutos}m ${segundos % 60}s`;
      return `${segundos}s`;
    } else if (fechaActualizacion > fecha) {
      const diferencia = fechaActualizacion.getTime() - fecha.getTime();

      const segundos = Math.floor(diferencia / 1000);
      const minutos = Math.floor(segundos / 60);
      const horas = Math.floor(minutos / 60);
      const días = Math.floor(horas / 24);

      if (días > 0) return `${días}d ${horas % 24}h`;
      if (horas > 0) return `${horas}h ${minutos % 60}m`;
      if (minutos > 0) return `${minutos}m ${segundos % 60}s`;
      return `${segundos}s`;
    }
  };

  return calcularTiempoTranscurrido(createdAt, updatedAt);
};

// Función auxiliar para convertir el formato de hora a minutos
const timeToMinutes = (time: string): number => {
  const [hours] = time.split(":").map(Number);
  return hours * 60;
};

// Función para verificar si dos rangos de tiempo se solapan
const isTimeOverlap = (time1: string, time2: string): boolean => {
  const [start1, end1] = time1.split("-").map(timeToMinutes);
  const [start2, end2] = time2.split("-").map(timeToMinutes);

  return !(end1 <= start2 || end2 <= start1);
};

export { SolicitudTiempoEspera, isTimeOverlap };
