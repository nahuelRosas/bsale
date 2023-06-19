<!DOCTYPE html>
<html>
<head>
  <title>Tutorial: Explicación de la función getFlightData()</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    h1 {
      color: #333;
      font-size: 24px;
      margin-bottom: 10px;
    }
    h2 {
      color: #333;
      font-size: 20px;
      margin-top: 30px;
      margin-bottom: 10px;
    }
    p {
      color: #666;
      font-size: 16px;
      margin-bottom: 10px;
    }
    ul {
      list-style-type: disc;
      margin-left: 20px;
      margin-bottom: 10px;
    }
    pre {
      background-color: #f8f8f8;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>Tutorial: Explicación de la función getFlightData()</h1>
  <p>En este tutorial, vamos a explicar la lógica y el propósito de cada paso en la función <code>getFlightData()</code>. Esta función se utiliza para obtener los datos de un vuelo, los pases de abordar, los pasajeros y realizar la asignación de asientos.</p>

  <h2>Paso 1: Definición y estructura de la función</h2>
  <p>La función <code>getFlightData()</code> es una función asincrónica que recibe un objeto destructurado con una propiedad <code>id</code> de tipo número. Devuelve una promesa con un tipo de respuesta que puede ser exitosa o de error. Aquí está la estructura de la función:</p>
  <pre>
  async getFlightData({ id }: { id: number }): Promise<
    | { code: number; data: object }
    | {
        code: number;
        data: {
          flight: flight;
          availableSeats: seat[];
          boardingPasses: BoardingPassWithDetails[];
          passengers: passenger[];
          groupedBoardingPasses: Record<string, BoardingPassWithDetails[]>;
        };
      }
  > {
    // ... Código del paso 2 al paso 15 ...
  }
  </pre>

  <h2>Paso 2: Conversión del ID del vuelo</h2>
  <p>En este paso, se convierte el ID del vuelo a un número y se asigna a la variable <code>flightId</code>. Esto se hace para asegurarse de que el ID sea del tipo esperado.</p>

  <h2>Paso 3: Obtención de los detalles del vuelo</h2>
  <p>Se utiliza la función <code>this.flightsRepository.getFlightById()</code> para obtener los detalles del vuelo correspondiente al <code>flightId</code> proporcionado. Los detalles del vuelo se asignan a <code>this.data.flight</code>.</p>

  <h2>Paso 4: Manejo de vuelo no encontrado</h2>
  <p>Si no se encuentra el vuelo (es decir, <code>this.data.flight</code> es falsy), se retorna una respuesta de error con el código 404 y un objeto de datos vacío.</p>

  <h2>Paso 5: Obtención de los pases de abordar</h2>
  <p

> Se utiliza la función <code>this.flightsRepository.getBoardingPassesByFlightId()</code> para obtener los pases de abordar del vuelo correspondiente al <code>flightId</code>. Los pases de abordar se asignan a <code>this.data.boardingPasses</code>.</p>

  <h2>Paso 6: Obtención de los pasajeros</h2>
  <p>Se utiliza la función <code>this.flightsRepository.getPassengersByBoardingPasses()</code> para obtener los pasajeros asociados a los pases de abordar. Los pasajeros se asignan a <code>this.data.passengers</code>.</p>

  <h2>Paso 7: Agrupación y ordenación de los pases de abordar</h2>
  <p>Se utiliza la función <code>groupBoardingPassesByPurchaseId()</code> para agrupar los pases de abordar por ID de compra y ordenarlos por edad del pasajero. Los pases de abordar agrupados se asignan a <code>this.data.groupedBoardingPasses</code>.</p>

  <h2>Paso 8: Obtención de los asientos disponibles</h2>
  <p>Se utiliza la función <code>this.flightsRepository.getAvailableSeats()</code> para obtener los asientos disponibles para el vuelo. Se proporciona el ID del avión (<code>airplaneId</code>) y el <code>flightId</code>. Los asientos disponibles se asignan a <code>this.data.availableSeats</code>.</p>

  <h2>Paso 9: Procesamiento de los grupos de pases de abordar</h2>
  <p>Se itera sobre cada <code>purchaseId</code> en <code>this.data.groupedBoardingPasses</code> y se realiza un procesamiento para cada grupo de pases de abordar.</p>

  <h2>Paso 10: Obtención de los pases de abordar del grupo actual</h2>
  <p>Se obtienen los pases de abordar correspondientes al <code>purchaseId</code> actual y se asignan a la variable <code>boardingPasses</code>.</p>

  <h2>Paso 11: Segregación de los pases de abordar por edad</h2>
  <p>Se utiliza la función <code>segregateBoardingPassesByAge()</code> para segregar los pases de abordar en grupos de adultos y niños, según la edad del pasajero. Los pases de abordar segregados se asignan a la variable <code>segregatedBoardingPasses</code>.</p>

  <h2>Paso 12: Búsqueda de asientos contiguos</h2>
  <p>Se utiliza la función <code>findAdjacentSeats()</code> para encontrar asientos contiguos para los pases de abordar dados. Se proporcionan los asientos disponibles (<code>this.data.availableSeats</code>) y los pases de abordar segregados (<code>segregatedBoardingPasses</code>). El resultado de los asientos contiguos se asigna a la variable <code>adjacentSeats</code>.</p>

  <h2>Paso 13: Asignación de asientos</h2>
  <p>Se utiliza la función <code>assignSeats()</code> para asignar asientos a los pases de abordar en base

a la disponibilidad de asientos contiguos. Se proporcionan los asientos contiguos (<code>adjacentSeats</code>), los pases de abordar originales (<code>this.data.boardingPasses</code>), los asientos disponibles (<code>this.data.availableSeats</code>) y el grupo de pases de abordar actual (<code>boardingPasses</code>). El resultado de la asignación de asientos se asigna a la variable <code>assignResult</code>.</p>

  <h2>Paso 14: Actualización de los pases de abordar y los asientos disponibles</h2>
  <p>Se actualizan los pases de abordar y los asientos disponibles después de la asignación de asientos, utilizando los valores obtenidos de <code>assignResult</code>.</p>

  <h2>Paso 15: Retorno de los datos del vuelo</h2>
  <p>Una vez que se han procesado todos los grupos de pases de abordar, se retorna una respuesta exitosa con el código 200 y los datos del vuelo (<code>this.data</code>).</p>

  <p>Esto concluye la explicación de la función <code>getFlightData()</code>. A lo largo del proceso, se recuperan los datos del vuelo, los pases de abordar y los pasajeros, se agrupan y ordenan los pases de abordar, se buscan asientos contiguos y se asignan asientos a los pasajeros. El objetivo principal es obtener los datos necesarios para el vuelo y realizar la asignación de asientos de manera eficiente.</p>
</body>
</html>
