import { z } from 'zod';
import { AtlasFhirClient } from '../client';
export declare const ObservationReferenceRangeSchema: z.ZodObject<{
    low: z.ZodOptional<z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    }, {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    }>>;
    high: z.ZodOptional<z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    }, {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    }>>;
    type: z.ZodOptional<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }>>;
    appliesTo: z.ZodOptional<z.ZodArray<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }>, "many">>;
    age: z.ZodOptional<z.ZodObject<{
        low: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>>;
        high: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        low?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        high?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
    }, {
        low?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        high?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
    }>>;
    text: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    text?: string | undefined;
    low?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    high?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    appliesTo?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }[] | undefined;
    age?: {
        low?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        high?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
    } | undefined;
}, {
    type?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    text?: string | undefined;
    low?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    high?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    appliesTo?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }[] | undefined;
    age?: {
        low?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        high?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
    } | undefined;
}>;
export declare const ObservationComponentSchema: z.ZodObject<{
    code: z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }>;
    valueQuantity: z.ZodOptional<z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    }, {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    }>>;
    valueCodeableConcept: z.ZodOptional<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }>>;
    valueString: z.ZodOptional<z.ZodString>;
    valueBoolean: z.ZodOptional<z.ZodBoolean>;
    valueInteger: z.ZodOptional<z.ZodNumber>;
    valueRange: z.ZodOptional<z.ZodObject<{
        low: z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>;
        high: z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }, {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }>>;
    valueRatio: z.ZodOptional<z.ZodObject<{
        numerator: z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>;
        denominator: z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        numerator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        denominator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }, {
        numerator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        denominator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }>>;
    valueSampledData: z.ZodOptional<z.ZodAny>;
    valueTime: z.ZodOptional<z.ZodString>;
    valueDateTime: z.ZodOptional<z.ZodString>;
    valuePeriod: z.ZodOptional<z.ZodAny>;
    dataAbsentReason: z.ZodOptional<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }>>;
    interpretation: z.ZodOptional<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }>>;
    referenceRange: z.ZodOptional<z.ZodArray<z.ZodObject<{
        low: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>>;
        high: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>>;
        type: z.ZodOptional<z.ZodObject<{
            coding: z.ZodArray<z.ZodObject<{
                system: z.ZodString;
                code: z.ZodString;
                display: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                system: string;
                display?: string | undefined;
            }, {
                code: string;
                system: string;
                display?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }>>;
        appliesTo: z.ZodOptional<z.ZodArray<z.ZodObject<{
            coding: z.ZodArray<z.ZodObject<{
                system: z.ZodString;
                code: z.ZodString;
                display: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                system: string;
                display?: string | undefined;
            }, {
                code: string;
                system: string;
                display?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }>, "many">>;
        age: z.ZodOptional<z.ZodObject<{
            low: z.ZodOptional<z.ZodObject<{
                value: z.ZodNumber;
                unit: z.ZodString;
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }>>;
            high: z.ZodOptional<z.ZodObject<{
                value: z.ZodNumber;
                unit: z.ZodString;
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        }, {
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        }>>;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        text?: string | undefined;
        low?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        high?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        appliesTo?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }[] | undefined;
        age?: {
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        } | undefined;
    }, {
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        text?: string | undefined;
        low?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        high?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        appliesTo?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }[] | undefined;
        age?: {
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        } | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    code: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    };
    valueQuantity?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    valueCodeableConcept?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    valueString?: string | undefined;
    valueBoolean?: boolean | undefined;
    valueInteger?: number | undefined;
    valueRange?: {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    valueRatio?: {
        numerator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        denominator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    valueSampledData?: any;
    valueTime?: string | undefined;
    valueDateTime?: string | undefined;
    valuePeriod?: any;
    dataAbsentReason?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    interpretation?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    referenceRange?: {
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        text?: string | undefined;
        low?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        high?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        appliesTo?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }[] | undefined;
        age?: {
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        } | undefined;
    }[] | undefined;
}, {
    code: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    };
    valueQuantity?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    valueCodeableConcept?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    valueString?: string | undefined;
    valueBoolean?: boolean | undefined;
    valueInteger?: number | undefined;
    valueRange?: {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    valueRatio?: {
        numerator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        denominator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    valueSampledData?: any;
    valueTime?: string | undefined;
    valueDateTime?: string | undefined;
    valuePeriod?: any;
    dataAbsentReason?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    interpretation?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    referenceRange?: {
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        text?: string | undefined;
        low?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        high?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        appliesTo?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }[] | undefined;
        age?: {
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        } | undefined;
    }[] | undefined;
}>;
export declare const ObservationSchema: z.ZodObject<{
    resourceType: z.ZodLiteral<"Observation">;
    id: z.ZodOptional<z.ZodString>;
    identifier: z.ZodOptional<z.ZodArray<z.ZodObject<{
        use: z.ZodOptional<z.ZodEnum<["usual", "official", "temp", "secondary", "old"]>>;
        type: z.ZodOptional<z.ZodObject<{
            coding: z.ZodArray<z.ZodObject<{
                system: z.ZodString;
                code: z.ZodString;
                display: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                system: string;
                display?: string | undefined;
            }, {
                code: string;
                system: string;
                display?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }>>;
        system: z.ZodOptional<z.ZodString>;
        value: z.ZodString;
        period: z.ZodOptional<z.ZodObject<{
            start: z.ZodOptional<z.ZodString>;
            end: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            start?: string | undefined;
            end?: string | undefined;
        }, {
            start?: string | undefined;
            end?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        use?: "usual" | "official" | "temp" | "secondary" | "old" | undefined;
        system?: string | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }, {
        value: string;
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        use?: "usual" | "official" | "temp" | "secondary" | "old" | undefined;
        system?: string | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }>, "many">>;
    basedOn: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    partOf: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    status: z.ZodEnum<["registered", "preliminary", "final", "amended", "corrected", "cancelled", "entered-in-error", "unknown"]>;
    category: z.ZodOptional<z.ZodArray<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }>, "many">>;
    code: z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }>;
    subject: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    focus: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    encounter: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    effectiveDateTime: z.ZodOptional<z.ZodString>;
    effectivePeriod: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>>;
    issued: z.ZodOptional<z.ZodString>;
    performer: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    valueQuantity: z.ZodOptional<z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    }, {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    }>>;
    valueCodeableConcept: z.ZodOptional<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }>>;
    valueString: z.ZodOptional<z.ZodString>;
    valueBoolean: z.ZodOptional<z.ZodBoolean>;
    valueInteger: z.ZodOptional<z.ZodNumber>;
    valueRange: z.ZodOptional<z.ZodObject<{
        low: z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>;
        high: z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }, {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }>>;
    valueRatio: z.ZodOptional<z.ZodObject<{
        numerator: z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>;
        denominator: z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        numerator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        denominator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }, {
        numerator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        denominator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    }>>;
    valueSampledData: z.ZodOptional<z.ZodAny>;
    valueTime: z.ZodOptional<z.ZodString>;
    valueDateTime: z.ZodOptional<z.ZodString>;
    valuePeriod: z.ZodOptional<z.ZodAny>;
    dataAbsentReason: z.ZodOptional<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }>>;
    interpretation: z.ZodOptional<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }>>;
    note: z.ZodOptional<z.ZodArray<z.ZodObject<{
        authorString: z.ZodOptional<z.ZodString>;
        time: z.ZodOptional<z.ZodString>;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        authorString?: string | undefined;
        time?: string | undefined;
    }, {
        text: string;
        authorString?: string | undefined;
        time?: string | undefined;
    }>, "many">>;
    bodySite: z.ZodOptional<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }>>;
    method: z.ZodOptional<z.ZodObject<{
        coding: z.ZodArray<z.ZodObject<{
            system: z.ZodString;
            code: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            system: string;
            display?: string | undefined;
        }, {
            code: string;
            system: string;
            display?: string | undefined;
        }>, "many">;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }, {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }>>;
    specimen: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    device: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    referenceRange: z.ZodOptional<z.ZodArray<z.ZodObject<{
        low: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>>;
        high: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>>;
        type: z.ZodOptional<z.ZodObject<{
            coding: z.ZodArray<z.ZodObject<{
                system: z.ZodString;
                code: z.ZodString;
                display: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                system: string;
                display?: string | undefined;
            }, {
                code: string;
                system: string;
                display?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }>>;
        appliesTo: z.ZodOptional<z.ZodArray<z.ZodObject<{
            coding: z.ZodArray<z.ZodObject<{
                system: z.ZodString;
                code: z.ZodString;
                display: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                system: string;
                display?: string | undefined;
            }, {
                code: string;
                system: string;
                display?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }>, "many">>;
        age: z.ZodOptional<z.ZodObject<{
            low: z.ZodOptional<z.ZodObject<{
                value: z.ZodNumber;
                unit: z.ZodString;
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }>>;
            high: z.ZodOptional<z.ZodObject<{
                value: z.ZodNumber;
                unit: z.ZodString;
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        }, {
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        }>>;
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        text?: string | undefined;
        low?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        high?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        appliesTo?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }[] | undefined;
        age?: {
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        } | undefined;
    }, {
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        text?: string | undefined;
        low?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        high?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        appliesTo?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }[] | undefined;
        age?: {
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        } | undefined;
    }>, "many">>;
    hasMember: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    derivedFrom: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    component: z.ZodOptional<z.ZodArray<z.ZodObject<{
        code: z.ZodObject<{
            coding: z.ZodArray<z.ZodObject<{
                system: z.ZodString;
                code: z.ZodString;
                display: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                system: string;
                display?: string | undefined;
            }, {
                code: string;
                system: string;
                display?: string | undefined;
            }>, "many">;
            text: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }>;
        valueQuantity: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }, {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        }>>;
        valueCodeableConcept: z.ZodOptional<z.ZodObject<{
            coding: z.ZodArray<z.ZodObject<{
                system: z.ZodString;
                code: z.ZodString;
                display: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                system: string;
                display?: string | undefined;
            }, {
                code: string;
                system: string;
                display?: string | undefined;
            }>, "many">;
            text: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }>>;
        valueString: z.ZodOptional<z.ZodString>;
        valueBoolean: z.ZodOptional<z.ZodBoolean>;
        valueInteger: z.ZodOptional<z.ZodNumber>;
        valueRange: z.ZodOptional<z.ZodObject<{
            low: z.ZodObject<{
                value: z.ZodNumber;
                unit: z.ZodString;
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }>;
            high: z.ZodObject<{
                value: z.ZodNumber;
                unit: z.ZodString;
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            low: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
            high: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
        }, {
            low: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
            high: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
        }>>;
        valueRatio: z.ZodOptional<z.ZodObject<{
            numerator: z.ZodObject<{
                value: z.ZodNumber;
                unit: z.ZodString;
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }>;
            denominator: z.ZodObject<{
                value: z.ZodNumber;
                unit: z.ZodString;
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            numerator: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
            denominator: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
        }, {
            numerator: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
            denominator: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
        }>>;
        valueSampledData: z.ZodOptional<z.ZodAny>;
        valueTime: z.ZodOptional<z.ZodString>;
        valueDateTime: z.ZodOptional<z.ZodString>;
        valuePeriod: z.ZodOptional<z.ZodAny>;
        dataAbsentReason: z.ZodOptional<z.ZodObject<{
            coding: z.ZodArray<z.ZodObject<{
                system: z.ZodString;
                code: z.ZodString;
                display: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                system: string;
                display?: string | undefined;
            }, {
                code: string;
                system: string;
                display?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }>>;
        interpretation: z.ZodOptional<z.ZodObject<{
            coding: z.ZodArray<z.ZodObject<{
                system: z.ZodString;
                code: z.ZodString;
                display: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                system: string;
                display?: string | undefined;
            }, {
                code: string;
                system: string;
                display?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }, {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }>>;
        referenceRange: z.ZodOptional<z.ZodArray<z.ZodObject<{
            low: z.ZodOptional<z.ZodObject<{
                value: z.ZodNumber;
                unit: z.ZodString;
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }>>;
            high: z.ZodOptional<z.ZodObject<{
                value: z.ZodNumber;
                unit: z.ZodString;
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }, {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            }>>;
            type: z.ZodOptional<z.ZodObject<{
                coding: z.ZodArray<z.ZodObject<{
                    system: z.ZodString;
                    code: z.ZodString;
                    display: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }, {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            }, {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            }>>;
            appliesTo: z.ZodOptional<z.ZodArray<z.ZodObject<{
                coding: z.ZodArray<z.ZodObject<{
                    system: z.ZodString;
                    code: z.ZodString;
                    display: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }, {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            }, {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            }>, "many">>;
            age: z.ZodOptional<z.ZodObject<{
                low: z.ZodOptional<z.ZodObject<{
                    value: z.ZodNumber;
                    unit: z.ZodString;
                    system: z.ZodOptional<z.ZodString>;
                    code: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                }, {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                }>>;
                high: z.ZodOptional<z.ZodObject<{
                    value: z.ZodNumber;
                    unit: z.ZodString;
                    system: z.ZodOptional<z.ZodString>;
                    code: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                }, {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                }>>;
            }, "strip", z.ZodTypeAny, {
                low?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
                high?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
            }, {
                low?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
                high?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
            }>>;
            text: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type?: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            } | undefined;
            text?: string | undefined;
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            appliesTo?: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            }[] | undefined;
            age?: {
                low?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
                high?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
            } | undefined;
        }, {
            type?: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            } | undefined;
            text?: string | undefined;
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            appliesTo?: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            }[] | undefined;
            age?: {
                low?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
                high?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
            } | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        code: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        };
        valueQuantity?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        valueCodeableConcept?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        valueString?: string | undefined;
        valueBoolean?: boolean | undefined;
        valueInteger?: number | undefined;
        valueRange?: {
            low: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
            high: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
        } | undefined;
        valueRatio?: {
            numerator: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
            denominator: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
        } | undefined;
        valueSampledData?: any;
        valueTime?: string | undefined;
        valueDateTime?: string | undefined;
        valuePeriod?: any;
        dataAbsentReason?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        interpretation?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        referenceRange?: {
            type?: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            } | undefined;
            text?: string | undefined;
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            appliesTo?: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            }[] | undefined;
            age?: {
                low?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
                high?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
            } | undefined;
        }[] | undefined;
    }, {
        code: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        };
        valueQuantity?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        valueCodeableConcept?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        valueString?: string | undefined;
        valueBoolean?: boolean | undefined;
        valueInteger?: number | undefined;
        valueRange?: {
            low: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
            high: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
        } | undefined;
        valueRatio?: {
            numerator: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
            denominator: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
        } | undefined;
        valueSampledData?: any;
        valueTime?: string | undefined;
        valueDateTime?: string | undefined;
        valuePeriod?: any;
        dataAbsentReason?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        interpretation?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        referenceRange?: {
            type?: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            } | undefined;
            text?: string | undefined;
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            appliesTo?: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            }[] | undefined;
            age?: {
                low?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
                high?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
            } | undefined;
        }[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    code: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    };
    status: "unknown" | "entered-in-error" | "cancelled" | "registered" | "preliminary" | "final" | "amended" | "corrected";
    resourceType: "Observation";
    id?: string | undefined;
    identifier?: {
        value: string;
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        use?: "usual" | "official" | "temp" | "secondary" | "old" | undefined;
        system?: string | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }[] | undefined;
    basedOn?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    category?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    subject?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    encounter?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    performer?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    bodySite?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    note?: {
        text: string;
        authorString?: string | undefined;
        time?: string | undefined;
    }[] | undefined;
    partOf?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    method?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    valueQuantity?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    valueCodeableConcept?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    valueString?: string | undefined;
    valueBoolean?: boolean | undefined;
    valueInteger?: number | undefined;
    valueRange?: {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    valueRatio?: {
        numerator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        denominator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    valueSampledData?: any;
    valueTime?: string | undefined;
    valueDateTime?: string | undefined;
    valuePeriod?: any;
    dataAbsentReason?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    interpretation?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    referenceRange?: {
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        text?: string | undefined;
        low?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        high?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        appliesTo?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }[] | undefined;
        age?: {
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        } | undefined;
    }[] | undefined;
    focus?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    effectiveDateTime?: string | undefined;
    effectivePeriod?: {
        start: string;
        end: string;
    } | undefined;
    issued?: string | undefined;
    specimen?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    device?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    hasMember?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    derivedFrom?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    component?: {
        code: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        };
        valueQuantity?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        valueCodeableConcept?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        valueString?: string | undefined;
        valueBoolean?: boolean | undefined;
        valueInteger?: number | undefined;
        valueRange?: {
            low: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
            high: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
        } | undefined;
        valueRatio?: {
            numerator: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
            denominator: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
        } | undefined;
        valueSampledData?: any;
        valueTime?: string | undefined;
        valueDateTime?: string | undefined;
        valuePeriod?: any;
        dataAbsentReason?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        interpretation?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        referenceRange?: {
            type?: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            } | undefined;
            text?: string | undefined;
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            appliesTo?: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            }[] | undefined;
            age?: {
                low?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
                high?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
            } | undefined;
        }[] | undefined;
    }[] | undefined;
}, {
    code: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    };
    status: "unknown" | "entered-in-error" | "cancelled" | "registered" | "preliminary" | "final" | "amended" | "corrected";
    resourceType: "Observation";
    id?: string | undefined;
    identifier?: {
        value: string;
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        use?: "usual" | "official" | "temp" | "secondary" | "old" | undefined;
        system?: string | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }[] | undefined;
    basedOn?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    category?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    subject?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    encounter?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    performer?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    bodySite?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    note?: {
        text: string;
        authorString?: string | undefined;
        time?: string | undefined;
    }[] | undefined;
    partOf?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    method?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    valueQuantity?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    valueCodeableConcept?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    valueString?: string | undefined;
    valueBoolean?: boolean | undefined;
    valueInteger?: number | undefined;
    valueRange?: {
        low: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        high: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    valueRatio?: {
        numerator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
        denominator: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        };
    } | undefined;
    valueSampledData?: any;
    valueTime?: string | undefined;
    valueDateTime?: string | undefined;
    valuePeriod?: any;
    dataAbsentReason?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    interpretation?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    referenceRange?: {
        type?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        text?: string | undefined;
        low?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        high?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        appliesTo?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }[] | undefined;
        age?: {
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
        } | undefined;
    }[] | undefined;
    focus?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    effectiveDateTime?: string | undefined;
    effectivePeriod?: {
        start: string;
        end: string;
    } | undefined;
    issued?: string | undefined;
    specimen?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    device?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    hasMember?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    derivedFrom?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    component?: {
        code: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        };
        valueQuantity?: {
            value: number;
            unit: string;
            code?: string | undefined;
            system?: string | undefined;
        } | undefined;
        valueCodeableConcept?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        valueString?: string | undefined;
        valueBoolean?: boolean | undefined;
        valueInteger?: number | undefined;
        valueRange?: {
            low: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
            high: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
        } | undefined;
        valueRatio?: {
            numerator: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
            denominator: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            };
        } | undefined;
        valueSampledData?: any;
        valueTime?: string | undefined;
        valueDateTime?: string | undefined;
        valuePeriod?: any;
        dataAbsentReason?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        interpretation?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        } | undefined;
        referenceRange?: {
            type?: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            } | undefined;
            text?: string | undefined;
            low?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            high?: {
                value: number;
                unit: string;
                code?: string | undefined;
                system?: string | undefined;
            } | undefined;
            appliesTo?: {
                coding: {
                    code: string;
                    system: string;
                    display?: string | undefined;
                }[];
            }[] | undefined;
            age?: {
                low?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
                high?: {
                    value: number;
                    unit: string;
                    code?: string | undefined;
                    system?: string | undefined;
                } | undefined;
            } | undefined;
        }[] | undefined;
    }[] | undefined;
}>;
export type Observation = z.infer<typeof ObservationSchema>;
export type ObservationReferenceRange = z.infer<typeof ObservationReferenceRangeSchema>;
export type ObservationComponent = z.infer<typeof ObservationComponentSchema>;
export interface ObservationResourceConfig {
    defaultTimeoutMs: number;
    retry: RetryConfig;
    circuitBreaker: CircuitBreakerConfig;
    enableMetrics: boolean;
    enableEventLogging: boolean;
    enableTracing: boolean;
}
export interface RetryConfig {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    jitterFactor: number;
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    timeoutMs: number;
    halfOpenMaxCalls: number;
}
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare class ObservationResourceError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, cause?: unknown | undefined);
}
interface MetricsSnapshot {
    operationCount: number;
    successCount: number;
    failureCount: number;
    errorCount: number;
    lastError?: string;
    operationDistribution: Record<string, number>;
    durationHistogram: number[];
}
interface EventLog {
    id: string;
    type: string;
    timestamp: string;
    source: string;
    operation: string;
    observationId?: string;
    patientId?: string;
    data: any;
    success: boolean;
}
interface Span {
    end(): void;
    setAttribute(key: string, value: unknown): void;
    recordException(error: Error): void;
}
interface Tracer {
    startSpan(name: string, options?: {
        attributes?: Record<string, unknown>;
    }): Span;
}
export declare function setTracer(tracer: Tracer): void;
interface HealthStatus {
    healthy: boolean;
    services: Map<string, {
        healthy: boolean;
        lastFailure?: string;
    }>;
    circuitBreakers: Map<string, {
        state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
        failures: number;
    }>;
}
export declare class ObservationResource {
    private client;
    private config;
    private metrics;
    private logger;
    private tracer;
    private circuitBreaker;
    private retryStrategy;
    private healthChecker;
    constructor(client: AtlasFhirClient, config?: Partial<ObservationResourceConfig>);
    create(observation: Observation): Promise<Observation>;
    read(id: string): Promise<Observation>;
    update(observation: Observation): Promise<Observation>;
    delete(id: string): Promise<void>;
    search(params: {
        patient?: string;
        subject?: string;
        code?: string;
        category?: string;
        status?: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
        date?: string;
        value_quantity?: string;
        combo_code?: string;
        component_code?: string;
        _count?: number;
        _page?: number;
        _sort?: string;
    }): Promise<any>;
    getVitalSigns(patientId: string, dateRange?: {
        start: string;
        end: string;
    }): Promise<any>;
    getLabResults(patientId: string, dateRange?: {
        start: string;
        end: string;
    }): Promise<any>;
    getByLoincCode(patientId: string, loincCode: string): Promise<any>;
    createVitalSign(params: {
        patientId: string;
        loincCode: string;
        value: number;
        unit: string;
        effectiveDateTime: string;
        performerId?: string;
    }): Promise<Observation>;
    createBloodPressure(params: {
        patientId: string;
        systolic: number;
        diastolic: number;
        effectiveDateTime: string;
        performerId?: string;
    }): Promise<Observation>;
    getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot>;
    getEvents(): EventLog[];
    getHealth(): Promise<HealthStatus>;
    getInfo(): {
        name: string;
        version: string;
        capabilities: string[];
    };
    private retryWithTimeout;
    private recordMetrics;
}
export declare function createObservationResource(client: AtlasFhirClient, config?: Partial<ObservationResourceConfig>): ObservationResource;
export {};
//# sourceMappingURL=Observation.d.ts.map