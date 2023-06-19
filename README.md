# Flight Service Readme (Readme del Servicio de Vuelo)

Este fragmento de código representa una clase `FlightService` que es responsable de obtener datos de vuelo, agrupar y ordenar los pases de abordar, segregar los pases de abordar por edad del pasajero, encontrar asientos adyacentes y asignar asientos a los pases de abordar según la disponibilidad de asientos. Vamos a revisar el código y entender su funcionalidad.

## Uso

Para utilizar la clase `FlightService`, debes importarla desde el módulo especificado:

```typescript
import { FlightService } from 'ruta/al/servicio/de/vuelo';
```

Luego puedes crear una instancia de la clase `FlightService` y utilizar sus métodos.

```typescript
const flightService = new FlightService(flightsRepository, exceptionsService);
```

## Resumen de la Clase

### Constructor

El constructor de la clase `FlightService` inicializa la clase y establece las dependencias requeridas:

```typescript
constructor(
  private readonly flightsRepository: DatabaseFlightsRepository,
  private readonly exceptionsService: ExceptionsService,
)
```

### Propiedades

La clase tiene un objeto privado `data` que almacena información relacionada con el vuelo:

```typescript
private data = {
  flight: {} as flight,
  availableSeats: [] as seat[],
  boardingPasses: [] as BoardingPassWithDetails[],
  passengers: [] as passenger[],
  groupedBoardingPasses: {} as Record<string, BoardingPassWithDetails[]>,
};
```

### Métodos

#### `getFlightData({ id })`

Este método obtiene los datos del vuelo, incluyendo los asientos disponibles, los pases de abordar, los pasajeros y los pases de abordar agrupados. Toma como parámetro un objeto con el ID del vuelo y devuelve una promesa con los datos del vuelo o un código de error y un objeto vacío si no se encuentra el vuelo.

```typescript
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
>
```

#### `groupBoardingPassesByPurchaseId({ boardingPasses })`

Este método agrupa los pases de abordar por ID de compra y los ordena por edad del pasajero. Toma como parámetro un objeto con los pases de abordar y devuelve una promesa con un registro que contiene los pases de abordar agrupados y ordenados.

```typescript
async groupBoardingPassesByPurchaseId({
  boardingPasses,
}: {
  boardingPasses: BoardingPassWithDetails[];
}): Promise<Record<string, BoardingPassWithDetails[]>> 
```

#### `segregateBoardingPassesByAge({ boardingPasses, passengers })`

Este método segrega los pases de abordar por edad del pasajero en adultos y niños. Toma como parámetro un objeto con los pases de abordar y los pasajeros, y devuelve una promesa con un objeto que contiene los pases de abordar segregados para adultos y niños.

```typescript
async segregateBoardingPassesByAge({
  boardingPasses

,
  passengers,
}: {
  boardingPasses: BoardingPassWithDetails[];
  passengers: passenger[];
}): Promise<{ adults: BoardingPassWithDetails[]; children: BoardingPassWithDetails[] }> 
```

#### `findAdjacentSeats({ numSeats })`

Este método encuentra asientos adyacentes disponibles en el vuelo. Toma como parámetro el número de asientos contiguos deseados y devuelve una promesa con un array de asientos adyacentes disponibles.

```typescript
async findAdjacentSeats({ numSeats }: { numSeats: number }): Promise<seat[]> 
```

#### `assignSeatsToBoardingPasses({ boardingPasses })`

Este método asigna asientos a los pases de abordar según la disponibilidad de asientos. Toma como parámetro los pases de abordar y devuelve una promesa con los pases de abordar actualizados con los asientos asignados.

```typescript
async assignSeatsToBoardingPasses({
  boardingPasses,
}: {
  boardingPasses: BoardingPassWithDetails[];
}): Promise<BoardingPassWithDetails[]> 
```

## Finalidad

El objetivo de este archivo es proporcionar una clase `FlightService` reutilizable que encapsule la lógica relacionada con la gestión de datos de vuelo y pases de abordar. La clase permite obtener datos de vuelo, agrupar y ordenar pases de abordar, segregar pases de abordar por edad, encontrar asientos adyacentes y asignar asientos a los pases de abordar según la disponibilidad.

La finalidad principal es facilitar el desarrollo de aplicaciones relacionadas con la gestión de vuelos y pases de abordar, proporcionando métodos y funciones que realizan las operaciones necesarias de manera eficiente y organizada. Los métodos de la clase `FlightService` pueden ser utilizados por otras partes del código para obtener y manipular los datos relacionados con los vuelos y pases de abordar de manera coherente y sin duplicar código.
