import { Err, None, Some } from "js-basic-monad";
import { match, select, __, not } from "ts-pattern";
import L, { List, LoDashStatic } from "lodash";
import job from "./job.json";

interface Lodash extends LoDashStatic {
  combine: (
    enumProperty: Enum,
    addQuotes: boolean,
    shouldProcessNull: boolean
  ) => string;
}

function combine(
  enumProperty: Enum,
  addQuotes: boolean,
  shouldProcessNull: boolean
) {
  return _(enumProperty).reduce((acc, val) => {
    if (acc.length !== 0) {
      acc += " | ";
    }
    let value;
    if (val) {
      value = addQuotes ? `'${val}'` : val;
    } else if (shouldProcessNull) {
      value = val;
    } else {
      acc = acc.slice(0, acc.length - 2);
      return acc;
    }
    acc += value;
    return acc;
  }, "");
}

L.mixin({ combine });

const _: Lodash = L;

type PropertyType = "string" | "number" | "object" | "boolean" | "null";

type Enum = (string | null)[];

type Property = {
  title: string;
  type: PropertyType | PropertyType[];
  enum?: Enum;
  properties?: {
    [key: string]: Property;
  };
};

type Properties = {
  [prop: string]: Property;
};

type Schema = {
  type: string;
  properties: Properties;
  required?: string[];
};

const schema: Schema = {
  type: "string",
  properties: {
    completedOnboarding: {
      title: "Completed Onboarding",
      type: ["string", "null"]
    },
    nestedProperty: {
      title: "Nested property",
      type: "object",
      properties: {
        test: {
          title: "test",
          type: ["string", "null"]
        }
      }
    },
    enumTest: {
      title: "Enum test",
      type: ["string", "null"],
      enum: ["joka", "boka", "test", null]
    },
    regularProperty: {
      title: "regular property",
      type: ["number", "null"]
    },
    singleProperty: {
      title: "single property",
      type: "boolean"
    },
    estimatedAnnualIncome: {
      title: "lmao",
      type: "object",
      properties: {
        amount: {
          title: "Amount",
          type: "number"
        },
        currencyId: {
          title: "Currency Code",
          type: ["string", "null"],
          enum: [null, "", "USD", "EUR", "ILS", "GBP"]
        }
      }
    },
    emptyProperty: {
      title: "test",
      type: ["object", "null"]
    },
    test: {
      title: "test",
      type: ["object", "null"],
      properties: {
        nested: {
          title: "test",
          type: ["null", "string"]
        },
        anotherOne: {
          title: "test",
          type: ["null", "string"]
        }
      }
    }
  },
  required: [""]
};

function processType(
  propertyKey: string,
  propertyType: PropertyType,
  property: Property
): string | null {
  return match(propertyType)
    .with("object", () => {
      const properties =
        _(property.properties)
          .map<string>((value: Property, key: string) =>
            match(value.type)
              .with([__.string, __.string], (arr: PropertyType[]) => {
                return (
                  `${key}:` +
                  _(arr)
                    .map((value: PropertyType) =>
                      processType(key, value, property)
                    )
                    .combine(false, true)
                );
              })
              .with(
                __,
                (vl: PropertyType) => `${key}: ${processType(key, vl, value)};`
              )
              .run()
          )
          .join("") + ";";

      return properties !== ";"
        ? `{ ${properties} }`
        : "{ [key: string]: any; }";
    })
    .with("string", (vl: string) =>
      property.enum
        ? _.combine(property.enum, true, property.type.indexOf("null") === -1)
        : vl
    )
    .with("null", () => null)
    .with(not("object"), (vl: string) => vl)
    .exhaustive();
}

function processProperty(fieldName: string, property: Property) {
  const { type } = property;
  const fieldType = match(type)
    .with(
      [__, __],
      (arr: PropertyType[]) =>
        _(arr)
          .map((value: PropertyType) => processType(fieldName, value, property))
          .combine(false, true) + ";"
    )
    .with(__, (vl: PropertyType) => `${processType(fieldName, vl, property)};`)
    .run();
  return `${fieldName}: ${fieldType}`;
}

/*
  step 1. simple generation with types and interfaces
  step 2. support enums
  step 3. make support for foreign keys
*/

function process(name: string, schema: Schema) {
  const mappedProperties: string = _(schema.properties)
    .map((value: Property, key: string) => processProperty(key.trim(), value))
    .join("\n");
  return `export interface ${name} { ${mappedProperties} }`;
}

const test = {
  type: "object",
  properties: job
};

const result = process("Test", schema);
console.log(result);

// document.getElementById("app").innerHTML = `
// <h1>Hello Parcel!</h1>
// <div>
//   Look
//   <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>
//   for more info about Parcel.
// </div>
// `;
