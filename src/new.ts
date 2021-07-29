import { Err, None, Some } from "js-basic-monad";
import { match, select, __, not, when } from "ts-pattern";
import _, { List, LoDashStatic } from "lodash";
import job from "./job.json";
import {
  justProperty,
  justPropertyNullable,
  justString,
  justStringEnum,
  justStringEnumNullable,
  justStringEnumNullableReversed,
  justStringNullable,
  onePropertyObject,
  onePropertyObjectNullable,
  twoPropertyObject,
  twoPropertyObjectNullable,
  twoPropertyObjectNullableAll,
  twoPropertyObjectNullableInvesred
} from "./testcases";

function combine(properties: Enum) {
  return _(properties).reduce((acc, val) => {
    if (acc.includes(val)) {
      return acc;
    }

    if (acc.length !== 0) {
      acc += " | ";
    }

    acc += val ? `${val}` : val;
    return acc;
  }, "");
}

function combineEnum(enumProperties: Enum) {
  return _(enumProperties)
    .filter((val) => val !== null)
    .reduce((acc, val) => {
      if (acc.length !== 0) {
        acc += " | ";
      }

      if (val === "") {
        acc += "''";
      } else {
        acc += `'${val}'`;
      }

      return acc;
    }, "");
}

type PropertyType = "string" | "number" | "object" | "boolean" | "null";

type Enum = (string | null)[];

type Property = {
  title: string;
  type: PropertyType | PropertyType[];
  enum?: Enum;
  properties?: Properties;
};

type Properties = {
  [prop: string]: Property;
};

type Schema = {
  type: string;
  properties: Properties;
  required?: string[];
};

/*
   1. Pass property
   2. if type is object, dive deeper;
   3. If no where to go, return type
   4. If type is not object, return type
   5. Make functions more atomic
   6. Retrieve all types for specific key, combine them via .combine
*/

function processType(
  propertyType: PropertyType,
  property: Property
): string | null {
  return match(propertyType)
    .with("null", () => null)
    .with("string", (vl: string) => {
      return property.enum ? combineEnum(property.enum) : vl;
    })
    .with(not("object"), (vl: string) => vl)
    .exhaustive();
}

function processProperty(fieldName: string, property: Property) {
  const { type } = property;

  const processObjectProperties = (properties: Properties) => {
    const nestedProperties = _(properties)
      .map((property: Property, key: string) => processProperty(key, property))
      .join("");
    return `{ ${nestedProperties} }`;
  };

  const fieldType = match(type)
    .with("object", () => {
      if (property.properties) {
        return processObjectProperties(property.properties);
      } else {
        return `{ [key: string]: any; }`;
      }
    })
    .with([__, __], (types: PropertyType[]) => {
      if (types.indexOf("object") > -1) {
        const singleTypeObject = processObjectProperties(property.properties);
        return combine([singleTypeObject, null]);
      }

      return combine([
        processType(types[0], property),
        processType(types[1], property)
      ]);
    })
    .with(__, (t: PropertyType) => processType(t, property))
    .exhaustive();
  return `${fieldName}: ${fieldType};`;
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

const result = process("Test", test);
console.log(result);

document.getElementById("app").innerHTML = `
<h1>Hello Parcel!</h1>
<div>
  Look
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>
  for more info about Parcel.
</div>
`;
