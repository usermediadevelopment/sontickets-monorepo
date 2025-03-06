export const getDayInSpanish = (day: string) => {
  switch (day) {
    case "Monday":
      return "Lunes";
    case "Tuesday":
      return "Martes";
    case "Wednesday":
      return "Miércoles";

    case "Thursday":
      return "Jueves";
    case "Friday":
      return "Viernes";
    case "Saturday":
      return "Sábado";
    case "Sunday":
      return "Domingo";

    default:
      return day;
  }
};
