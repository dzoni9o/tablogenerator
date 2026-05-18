import { defaultRowCapacity } from "./initialBoard";
import { createCatalogBreaker, createFid, createNeutralSwitch } from "../utils/breakerFactory";
import { createId } from "../utils/ids";

export const boardTemplates = [
  { id: "apartment-single", label: "Stan monofazno", rows: createApartmentSinglePhase },
  { id: "house-three", label: "Kuca trofazno", rows: createHouseThreePhase },
  { id: "shop", label: "Lokal", rows: createShopBoard },
  { id: "garage", label: "Garaza", rows: createGarageBoard },
  { id: "floor", label: "Spratna tabla", rows: createFloorBoard },
  { id: "cabinet", label: "Razvodni orman", rows: createCabinetBoard },
];

export function createRowsFromTemplate(templateId) {
  const template = boardTemplates.find((item) => item.id === templateId) ?? boardTemplates[0];
  return template.rows();
}

function createRow(name, breakers, capacity = defaultRowCapacity) {
  return {
    id: createId(),
    name,
    capacity,
    breakers,
  };
}

function createApartmentSinglePhase() {
  const fid = createFid("single", 1);
  return [
    createRow("Red 1", [
      fid,
      createNeutralSwitch(1, fid.id),
      createCatalogBreaker("spd", 1),
      namedBreaker("breaker", 1, "B10", "Rasveta"),
      namedBreaker("breaker", 2, "B16", "Uticnice sobe"),
      namedBreaker("breaker", 3, "B16", "Uticnice kuhinja"),
      namedBreaker("breaker", 4, "B20", "Bojler"),
      namedBreaker("breaker", 5, "B16", "Klima"),
      createCatalogBreaker("reserve", 1),
    ]),
  ];
}

function createHouseThreePhase() {
  const fid = createFid("three", 1);
  return [
    createRow("Red 1", [createCatalogBreaker("main", 1), createCatalogBreaker("spd", 1), fid, createNeutralSwitch(1, fid.id)], 18),
    createRow(
      "Red 2",
      [
        namedBreaker("breaker", 1, "B10", "Rasveta prizemlje"),
        namedBreaker("breaker", 2, "B10", "Rasveta sprat"),
        namedBreaker("breaker", 3, "B16", "Uticnice prizemlje"),
        namedBreaker("breaker", 4, "B16", "Uticnice sprat"),
        namedBreaker("breaker", 5, "B20", "Kuhinja"),
        namedBreaker("breaker", 6, "B25", "Sporet"),
        createCatalogBreaker("reserve", 1),
      ],
      18,
    ),
  ];
}

function createShopBoard() {
  return [
    createRow("Red 1", [createCatalogBreaker("main", 1), createCatalogBreaker("spd", 1), createCatalogBreaker("rcbo", 1), createCatalogBreaker("contactor", 1)], 18),
    createRow("Red 2", [namedBreaker("breaker", 1, "B10", "Rasveta"), namedBreaker("breaker", 2, "B16", "Uticnice"), createCatalogBreaker("timer", 1)], 18),
  ];
}

function createGarageBoard() {
  return [
    createRow("Red 1", [
      createCatalogBreaker("main", 1),
      namedBreaker("breaker", 1, "B10", "Rasveta"),
      namedBreaker("breaker", 2, "B16", "Uticnice"),
      createCatalogBreaker("bell", 1),
      createCatalogBreaker("reserve", 1),
    ]),
  ];
}

function createFloorBoard() {
  return [
    createRow("Red 1", [
      createFid("single", 1),
      namedBreaker("breaker", 1, "B10", "Rasveta"),
      namedBreaker("breaker", 2, "B16", "Uticnice"),
      namedBreaker("breaker", 3, "B16", "Klima"),
      createCatalogBreaker("impulse", 1),
    ]),
  ];
}

function createCabinetBoard() {
  return [
    createRow("Upravljanje", [createCatalogBreaker("main", 1), createCatalogBreaker("contactor", 1), createCatalogBreaker("timer", 1), createCatalogBreaker("impulse", 1)], 18),
    createRow("Izvodi", [createCatalogBreaker("rcbo", 1), createCatalogBreaker("rcbo", 2), createCatalogBreaker("busbar", 1), createCatalogBreaker("reserve", 1)], 18),
  ];
}

function namedBreaker(type, index, amp, description) {
  return {
    ...createCatalogBreaker(type, index),
    amp,
    description,
  };
}
