const SolicitudTiempoEspera = ({ createdAt }: { createdAt: string }) => {
  const calcularTiempoTranscurrido = (fechaInicial: string) => {
    const ahora = new Date();
    const fecha = new Date(fechaInicial);
    const diferencia = ahora.getTime() - fecha.getTime(); // Diferencia en milisegundos

    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const días = Math.floor(horas / 24);

    if (días > 0) return `${días} día${días > 1 ? "s" : ""}`;
    if (horas > 0) return `${horas} hora${horas > 1 ? "s" : ""}`;
    if (minutos > 0) return `${minutos} minuto${minutos > 1 ? "s" : ""}`;
    return `${segundos} segundo${segundos > 1 ? "s" : ""}`;
  };

  return calcularTiempoTranscurrido(createdAt);
};

export default SolicitudTiempoEspera;
