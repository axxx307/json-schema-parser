/*
  Cases:
  1. Object, just key, one nested property
  2. Object, just key, multiple nested properties
  3. Object, nullable, one nested property
  4. Object, nullable, multiple nested properties
  5. Object, nullable, reversed null and type
  5. String, not enum, just string
  6. String, not enum, nullable
  7. String, enum, just string
  8. String, enum, nullable
  9. Null, just num
  10. Any onther type, just type
  11. Any onther type, nullable
  12. Nested schema with required property :)))))
*/

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

export const onePropertyObject: Schema = {
  type: "object",
  properties: {
    onePropertyObject: {
      title: "test",
      type: "object",
      properties: {
        oneProperty: {
          title: "test",
          type: "string"
        }
      }
    }
  },
  required: [""]
};

export const twoPropertyObject: Schema = {
  type: "object",
  properties: {
    twoPropertyObject: {
      title: "test",
      type: "object",
      properties: {
        oneProperty: {
          title: "test",
          type: "string"
        },
        twoProperty: {
          title: "test",
          type: "boolean"
        }
      }
    }
  },
  required: [""]
};

export const onePropertyObjectNullable: Schema = {
  type: "object",
  properties: {
    onePropertyObject: {
      title: "test",
      type: ["object", "null"],
      properties: {
        oneProperty: {
          title: "test",
          type: "string"
        }
      }
    }
  },
  required: [""]
};

export const twoPropertyObjectNullable: Schema = {
  type: "object",
  properties: {
    twoPropertyObject: {
      title: "test",
      type: ["object", "null"],
      properties: {
        oneProperty: {
          title: "test",
          type: "string"
        },
        twoProperty: {
          title: "test",
          type: "boolean"
        }
      }
    }
  },
  required: [""]
};

export const twoPropertyObjectNullableInvesred: Schema = {
  type: "object",
  properties: {
    twoPropertyObject: {
      title: "test",
      type: ["null", "object"],
      properties: {
        oneProperty: {
          title: "test",
          type: "string"
        },
        twoProperty: {
          title: "test",
          type: "boolean"
        }
      }
    }
  },
  required: [""]
};

export const twoPropertyObjectNullableAll: Schema = {
  type: "object",
  properties: {
    twoPropertyObject: {
      title: "test",
      type: ["null", "object"],
      properties: {
        oneProperty: {
          title: "test",
          type: ["string", "null"]
        },
        twoProperty: {
          title: "test",
          type: ["boolean", "null"]
        }
      }
    }
  },
  required: [""]
};

export const justString: Schema = {
  type: "object",
  properties: {
    justString: {
      title: "test",
      type: "string"
    }
  }
};

export const justStringNullable: Schema = {
  type: "object",
  properties: {
    justString: {
      title: "test",
      type: ["string", "null"]
    }
  }
};

export const justStringEnum: Schema = {
  type: "object",
  properties: {
    justString: {
      title: "test",
      type: "string",
      enum: ["test", "test2"]
    }
  }
};

export const justStringEnumNullable: Schema = {
  type: "object",
  properties: {
    justString: {
      title: "test",
      type: ["string", "null"],
      enum: ["test", "test2", null]
    }
  }
};

export const justStringEnumNullableReversed: Schema = {
  type: "object",
  properties: {
    justString: {
      title: "test",
      type: ["string", "null"],
      enum: [null, "test", "test2"]
    }
  }
};

export const justProperty: Schema = {
  type: "object",
  properties: {
    justBoolean: {
      title: "test",
      type: "boolean"
    }
  }
};

export const justPropertyNullable: Schema = {
  type: "object",
  properties: {
    justBoolean: {
      title: "test",
      type: ["boolean", "null"]
    }
  }
};
