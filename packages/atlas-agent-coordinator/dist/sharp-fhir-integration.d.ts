import { z } from 'zod';
export declare const FhirPatientSchema: z.ZodObject<{
    id: z.ZodString;
    resourceType: z.ZodLiteral<"Patient">;
    name: z.ZodOptional<z.ZodArray<z.ZodObject<{
        use: z.ZodOptional<z.ZodString>;
        family: z.ZodOptional<z.ZodString>;
        given: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        use: z.ZodOptional<z.ZodString>;
        family: z.ZodOptional<z.ZodString>;
        given: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        use: z.ZodOptional<z.ZodString>;
        family: z.ZodOptional<z.ZodString>;
        given: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    birthDate: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other", "unknown"]>>;
    active: z.ZodOptional<z.ZodBoolean>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    id: z.ZodString;
    resourceType: z.ZodLiteral<"Patient">;
    name: z.ZodOptional<z.ZodArray<z.ZodObject<{
        use: z.ZodOptional<z.ZodString>;
        family: z.ZodOptional<z.ZodString>;
        given: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        use: z.ZodOptional<z.ZodString>;
        family: z.ZodOptional<z.ZodString>;
        given: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        use: z.ZodOptional<z.ZodString>;
        family: z.ZodOptional<z.ZodString>;
        given: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    birthDate: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other", "unknown"]>>;
    active: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    id: z.ZodString;
    resourceType: z.ZodLiteral<"Patient">;
    name: z.ZodOptional<z.ZodArray<z.ZodObject<{
        use: z.ZodOptional<z.ZodString>;
        family: z.ZodOptional<z.ZodString>;
        given: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        use: z.ZodOptional<z.ZodString>;
        family: z.ZodOptional<z.ZodString>;
        given: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        use: z.ZodOptional<z.ZodString>;
        family: z.ZodOptional<z.ZodString>;
        given: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    birthDate: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other", "unknown"]>>;
    active: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">>;
export declare const FhirObservationSchema: z.ZodObject<{
    id: z.ZodString;
    resourceType: z.ZodLiteral<"Observation">;
    status: z.ZodString;
    code: z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
    subject: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>>;
    effectiveDateTime: z.ZodOptional<z.ZodString>;
    valueQuantity: z.ZodOptional<z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    component: z.ZodOptional<z.ZodArray<z.ZodObject<{
        code: z.ZodObject<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>;
        valueQuantity: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        code: z.ZodObject<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>;
        valueQuantity: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        code: z.ZodObject<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>;
        valueQuantity: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    id: z.ZodString;
    resourceType: z.ZodLiteral<"Observation">;
    status: z.ZodString;
    code: z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
    subject: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>>;
    effectiveDateTime: z.ZodOptional<z.ZodString>;
    valueQuantity: z.ZodOptional<z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    component: z.ZodOptional<z.ZodArray<z.ZodObject<{
        code: z.ZodObject<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>;
        valueQuantity: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        code: z.ZodObject<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>;
        valueQuantity: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        code: z.ZodObject<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>;
        valueQuantity: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    id: z.ZodString;
    resourceType: z.ZodLiteral<"Observation">;
    status: z.ZodString;
    code: z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
    subject: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>>;
    effectiveDateTime: z.ZodOptional<z.ZodString>;
    valueQuantity: z.ZodOptional<z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        value: z.ZodNumber;
        unit: z.ZodString;
        system: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    component: z.ZodOptional<z.ZodArray<z.ZodObject<{
        code: z.ZodObject<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>;
        valueQuantity: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        code: z.ZodObject<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>;
        valueQuantity: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        code: z.ZodObject<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                system: z.ZodOptional<z.ZodString>;
                code: z.ZodOptional<z.ZodString>;
                display: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>, "many">>;
            text: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>;
        valueQuantity: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            value: z.ZodNumber;
            unit: z.ZodString;
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
}, z.ZodTypeAny, "passthrough">>;
export declare const FhirMedicationRequestSchema: z.ZodObject<{
    id: z.ZodString;
    resourceType: z.ZodLiteral<"MedicationRequest">;
    status: z.ZodString;
    intent: z.ZodString;
    medicationCodeableConcept: z.ZodOptional<z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    subject: z.ZodObject<{
        reference: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    authoredOn: z.ZodOptional<z.ZodString>;
    dosageInstruction: z.ZodOptional<z.ZodArray<z.ZodObject<{
        text: z.ZodOptional<z.ZodString>;
        timing: z.ZodOptional<z.ZodObject<{
            repeat: z.ZodOptional<z.ZodObject<{
                frequency: z.ZodOptional<z.ZodNumber>;
                period: z.ZodOptional<z.ZodNumber>;
                periodUnit: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodOptional<z.ZodString>;
        timing: z.ZodOptional<z.ZodObject<{
            repeat: z.ZodOptional<z.ZodObject<{
                frequency: z.ZodOptional<z.ZodNumber>;
                period: z.ZodOptional<z.ZodNumber>;
                periodUnit: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodOptional<z.ZodString>;
        timing: z.ZodOptional<z.ZodObject<{
            repeat: z.ZodOptional<z.ZodObject<{
                frequency: z.ZodOptional<z.ZodNumber>;
                period: z.ZodOptional<z.ZodNumber>;
                periodUnit: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }>>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    id: z.ZodString;
    resourceType: z.ZodLiteral<"MedicationRequest">;
    status: z.ZodString;
    intent: z.ZodString;
    medicationCodeableConcept: z.ZodOptional<z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    subject: z.ZodObject<{
        reference: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    authoredOn: z.ZodOptional<z.ZodString>;
    dosageInstruction: z.ZodOptional<z.ZodArray<z.ZodObject<{
        text: z.ZodOptional<z.ZodString>;
        timing: z.ZodOptional<z.ZodObject<{
            repeat: z.ZodOptional<z.ZodObject<{
                frequency: z.ZodOptional<z.ZodNumber>;
                period: z.ZodOptional<z.ZodNumber>;
                periodUnit: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodOptional<z.ZodString>;
        timing: z.ZodOptional<z.ZodObject<{
            repeat: z.ZodOptional<z.ZodObject<{
                frequency: z.ZodOptional<z.ZodNumber>;
                period: z.ZodOptional<z.ZodNumber>;
                periodUnit: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodOptional<z.ZodString>;
        timing: z.ZodOptional<z.ZodObject<{
            repeat: z.ZodOptional<z.ZodObject<{
                frequency: z.ZodOptional<z.ZodNumber>;
                period: z.ZodOptional<z.ZodNumber>;
                periodUnit: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }>>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    id: z.ZodString;
    resourceType: z.ZodLiteral<"MedicationRequest">;
    status: z.ZodString;
    intent: z.ZodString;
    medicationCodeableConcept: z.ZodOptional<z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    subject: z.ZodObject<{
        reference: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    authoredOn: z.ZodOptional<z.ZodString>;
    dosageInstruction: z.ZodOptional<z.ZodArray<z.ZodObject<{
        text: z.ZodOptional<z.ZodString>;
        timing: z.ZodOptional<z.ZodObject<{
            repeat: z.ZodOptional<z.ZodObject<{
                frequency: z.ZodOptional<z.ZodNumber>;
                period: z.ZodOptional<z.ZodNumber>;
                periodUnit: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        text: z.ZodOptional<z.ZodString>;
        timing: z.ZodOptional<z.ZodObject<{
            repeat: z.ZodOptional<z.ZodObject<{
                frequency: z.ZodOptional<z.ZodNumber>;
                period: z.ZodOptional<z.ZodNumber>;
                periodUnit: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        text: z.ZodOptional<z.ZodString>;
        timing: z.ZodOptional<z.ZodObject<{
            repeat: z.ZodOptional<z.ZodObject<{
                frequency: z.ZodOptional<z.ZodNumber>;
                period: z.ZodOptional<z.ZodNumber>;
                periodUnit: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }, {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }, {
            repeat?: {
                frequency?: number | undefined;
                period?: number | undefined;
                periodUnit?: string | undefined;
            } | undefined;
        }>>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
}, z.ZodTypeAny, "passthrough">>;
export declare const FhirConditionSchema: z.ZodObject<{
    id: z.ZodString;
    resourceType: z.ZodLiteral<"Condition">;
    clinicalStatus: z.ZodOptional<z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    code: z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
    subject: z.ZodObject<{
        reference: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    recordedDate: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    id: z.ZodString;
    resourceType: z.ZodLiteral<"Condition">;
    clinicalStatus: z.ZodOptional<z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    code: z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
    subject: z.ZodObject<{
        reference: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    recordedDate: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    id: z.ZodString;
    resourceType: z.ZodLiteral<"Condition">;
    clinicalStatus: z.ZodOptional<z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    code: z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
    subject: z.ZodObject<{
        reference: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        reference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    recordedDate: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodObject<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        coding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            system: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            display: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        text: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
}, z.ZodTypeAny, "passthrough">>;
export type FhirPatient = z.infer<typeof FhirPatientSchema>;
export type FhirObservation = z.infer<typeof FhirObservationSchema>;
export type FhirMedicationRequest = z.infer<typeof FhirMedicationRequestSchema>;
export type FhirCondition = z.infer<typeof FhirConditionSchema>;
export interface SHARPContextMetadata extends Readonly<Record<string, unknown>> {
    readonly fhirScopes: readonly string[];
    readonly consentScopes: readonly string[];
}
export interface SHARPContext {
    readonly patientId: string;
    readonly sessionId: string;
    readonly timestamp: Date;
    readonly propagationToken: string;
    readonly fhirToken?: string;
    readonly consentToken?: string;
    readonly metadata: SHARPContextMetadata;
}
export interface SHARPFhirConfig {
    readonly fhirBaseUrl: string;
    readonly fhirToken?: string;
    readonly consentScopes: readonly string[];
    readonly defaultFhirScopes: readonly string[];
    readonly patientId?: string;
    readonly sessionId?: string;
    readonly timeout: number;
    readonly maxRetries: number;
    readonly retryBaseDelayMs: number;
    readonly retryMaxDelayMs: number;
    readonly retryJitterRatio: number;
    readonly cacheTTL: number;
    readonly lockTTL: number;
    readonly sessionSecret: string;
    readonly cacheStore?: CacheStore;
    readonly lockProvider?: LockProvider;
    readonly auditLogger?: AuditLogger;
    readonly gateway?: FhirGateway;
    readonly now?: () => Date;
}
export interface ClinicalContext {
    readonly patientId: string;
    readonly timestamp: Date;
    readonly patient?: PatientInfo;
    readonly vitals?: Vitals;
    readonly medications: ReadonlyArray<MedicationInfo>;
    readonly conditions: ReadonlyArray<ConditionInfo>;
    readonly sharpContext?: {
        readonly sessionId: string;
        readonly propagationToken: string;
    };
    readonly metadata: Readonly<Record<string, unknown>>;
}
export interface PatientInfo {
    readonly id: string;
    readonly name: string;
    readonly birthDate?: string;
    readonly gender?: string;
    readonly age: number | null;
}
export interface Vitals {
    readonly heartRate?: VitalReading;
    readonly bloodPressure?: BloodPressureReading;
    readonly temperature?: VitalReading;
    readonly oxygenSaturation?: VitalReading;
    readonly respiratoryRate?: VitalReading;
}
export interface VitalReading {
    readonly value: number;
    readonly unit: string;
    readonly timestamp?: Date;
}
export interface BloodPressureReading {
    readonly systolic: number;
    readonly diastolic: number;
    readonly unit: string;
}
export interface MedicationInfo {
    readonly id: string;
    readonly name: string;
    readonly status: string;
    readonly dosage?: string;
    readonly frequency?: string;
    readonly prescribedDate?: Date;
}
export interface ConditionInfo {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly status?: string;
    readonly recordedDate?: Date;
    readonly severity?: string;
}
export interface ClinicalAlert {
    readonly code: 'tachycardia' | 'bradycardia' | 'hypertension' | 'hypertensive_crisis' | 'fever' | 'hypoxia' | 'tachypnea' | 'bradypnea';
    readonly severity: 'info' | 'warning' | 'critical';
    readonly message: string;
    readonly observedAt?: Date;
    readonly value?: number;
    readonly unit?: string;
}
export interface ClinicalInsights {
    readonly patientId: string;
    readonly derivedAt: Date;
    readonly acuity: 'low' | 'medium' | 'high';
    readonly alerts: ReadonlyArray<ClinicalAlert>;
    readonly summary: ReadonlyArray<string>;
}
export interface PatientTimelineEvent {
    readonly at: Date;
    readonly type: 'observation' | 'medication' | 'condition';
    readonly id: string;
    readonly title: string;
    readonly detail: string;
    readonly status?: string | unknown;
}
export interface PatientTimeline {
    readonly patientId: string;
    readonly generatedAt: Date;
    readonly events: ReadonlyArray<PatientTimelineEvent>;
    readonly errors: Readonly<Record<string, string>>;
}
export interface AuditEntry {
    readonly timestamp: Date;
    readonly requestId: string;
    readonly operation: string;
    readonly patientId: string;
    readonly success: boolean;
    readonly durationMs?: number;
    readonly errorCode?: string;
    readonly error?: string;
    readonly sharpSessionId?: string;
    readonly metadata?: Record<string, unknown>;
}
export type AuditLogger = (entry: AuditEntry) => void | Promise<void>;
export declare class SHARPFhirError extends Error {
    readonly code: string;
    readonly context?: Record<string, unknown>;
    readonly cause?: Error;
    constructor(message: string, code: string, context?: Record<string, unknown>, cause?: Error);
}
export declare class AuthorizationError extends SHARPFhirError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class ValidationError extends SHARPFhirError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class ResourceNotFoundError extends SHARPFhirError {
    constructor(resourceType: string, id: string, context?: Record<string, unknown>, cause?: Error);
}
export declare class TransportError extends SHARPFhirError {
    constructor(message: string, context?: Record<string, unknown>, cause?: Error);
}
export declare class ConfigurationError extends SHARPFhirError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class DisposedError extends SHARPFhirError {
    constructor();
}
export interface CacheStore {
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttlMs: number): Promise<void>;
    delete(key: string): Promise<void>;
    deleteByPrefix(prefix: string): Promise<number>;
    clear(): Promise<void>;
    close(): Promise<void>;
}
export interface LockLease {
    release(): Promise<void>;
}
export interface LockProvider {
    acquire(key: string, options?: {
        ttlMs?: number;
    }): Promise<LockLease>;
    close(): Promise<void>;
}
/**
 * In-memory cache with TTL and defensive cloning.
 * Swap this with Redis/Memcached/etc. via CacheStore for multi-node deployments.
 */
export declare class MemoryCacheStore implements CacheStore {
    private readonly defaultTtlMs;
    private readonly entries;
    private readonly cleanupTimer;
    constructor(defaultTtlMs?: number, cleanupEveryMs?: number);
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
    delete(key: string): Promise<void>;
    deleteByPrefix(prefix: string): Promise<number>;
    clear(): Promise<void>;
    close(): Promise<void>;
    private cleanupExpired;
}
/**
 * Fair local keyed lock.
 * Swap this for a distributed lock provider in multi-instance deployments.
 */
export declare class LocalLockProvider implements LockProvider {
    private readonly queues;
    acquire(key: string): Promise<LockLease>;
    close(): Promise<void>;
    private createLease;
}
export interface FhirSearchParams {
    readonly [key: string]: string | number | boolean | undefined;
}
export interface FhirGateway {
    readPatient(patientId: string): Promise<any>;
    searchObservations(params: FhirSearchParams): Promise<any[]>;
    searchMedicationRequests(params: FhirSearchParams): Promise<any[]>;
    searchConditions(params: FhirSearchParams): Promise<any[]>;
}
/**
 * Atlas adapter isolated behind a gateway so the integration service stays testable
 * and future transport changes remain localized.
 */
export declare class AtlasFhirGateway implements FhirGateway {
    private readonly config;
    private clientSnapshot?;
    constructor(config: {
        readonly baseUrl: string;
        readonly timeoutMs: number;
        readonly getAccessToken: () => string | undefined;
    });
    readPatient(patientId: string): Promise<any>;
    searchObservations(params: FhirSearchParams): Promise<any[]>;
    searchMedicationRequests(params: FhirSearchParams): Promise<any[]>;
    searchConditions(params: FhirSearchParams): Promise<any[]>;
    private getClient;
}
export declare const consoleAuditLogger: AuditLogger;
export declare class SHARPFhirIntegration {
    private readonly config;
    private readonly cacheStore;
    private readonly lockProvider;
    private readonly auditLogger;
    private readonly gateway;
    private readonly singleFlight;
    private sharpContext;
    private currentFhirToken?;
    private disposed;
    constructor(config?: Partial<SHARPFhirConfig>);
    /**
     * Initializes a SHARP session and updates the effective FHIR token for the transport layer.
     */
    initializeSHARPSession(patientId: string, sessionId: string, fhirScopes?: string[], consentScopes?: string[]): SHARPContext;
    getSHARPContext(): Readonly<SHARPContext> | null;
    propagateSHARPContext(targetAgent: string): Promise<Readonly<SHARPContext> | null>;
    getFHIRAuthorization(requiredScope: string): Promise<{
        authorized: boolean;
        token?: string;
    }>;
    getConsentAuthorization(requiredScope: string): Promise<{
        authorized: boolean;
        patientId?: string;
    }>;
    getPatientData(patientId: string, useCache?: boolean): Promise<FhirPatient>;
    getPatientObservations(patientId: string, options?: {
        codes?: string[];
        dateRange?: {
            start: Date;
            end: Date;
        };
        limit?: number;
        useCache?: boolean;
    }): Promise<ReadonlyArray<FhirObservation>>;
    getPatientMedications(patientId: string, status?: string): Promise<ReadonlyArray<FhirMedicationRequest>>;
    getPatientConditions(patientId: string, options?: {
        activeOnly?: boolean;
        useCache?: boolean;
    }): Promise<ReadonlyArray<FhirCondition>>;
    getClinicalContext(patientId: string, options?: {
        includeVitals?: boolean;
        includeMedications?: boolean;
        includeConditions?: boolean;
        useCache?: boolean;
    }): Promise<ClinicalContext>;
    getPatientSummary(patientId: string): Promise<{
        patient: PatientInfo;
        recentVitals: Vitals;
        activeMedicationsCount: number;
        activeConditionsCount: number;
        alerts: ReadonlyArray<ClinicalAlert>;
        lastUpdated: Date;
    }>;
    /**
     * Derived insights from current vitals. This is intentionally lightweight and explainable.
     */
    getClinicalInsights(patientId: string): Promise<ClinicalInsights>;
    getPatientTimeline(patientId: string, options?: {
        limit?: number;
        includeObservations?: boolean;
        includeMedications?: boolean;
        includeConditions?: boolean;
        useCache?: boolean;
    }): Promise<PatientTimeline>;
    warmPatientCache(patientId: string): Promise<{
        patientId: string;
        warmedAt: Date;
        success: boolean;
        details: Readonly<Record<string, string>>;
    }>;
    invalidatePatientCache(patientId: string): Promise<{
        patientId: string;
        deletedEntries: number;
    }>;
    exportSHARPProtocol(): {
        specification: string;
        version: string;
        capabilities: ReadonlyArray<string>;
    };
    createSHARPHandoff(fromAgent: string, toAgent: string, urgency?: 'ROUTINE' | 'URGENT' | 'EMERGENT', handoffType?: 'CARE_COORDINATION' | 'ESCALATION' | 'REFERRAL' | 'INFO_SHARING'): Promise<{
        handoffId: string;
        fromAgent: string;
        toAgent: string;
        context: Readonly<SHARPContext>;
        urgency: string;
        handoffType: string;
        status: string;
        timestamp: Date;
    }>;
    dispose(): Promise<void>;
    private assertNotDisposed;
    private updateFhirToken;
    private requireFhirScope;
    private requireConsentScope;
    private withCachedLoad;
    private runAudited;
    private emitAudit;
    private executeWithRetry;
    private computeRetryDelayMs;
    private wrapExternalError;
    private buildCacheKey;
    private buildCacheKeyPrefix;
    private generateToken;
    private extractPatientInfo;
    private extractVitals;
    private extractMedications;
    private extractMedication;
    private extractConditions;
    private extractCondition;
    private detectClinicalAlerts;
}
export declare function createSHARPFhirIntegration(config?: Partial<SHARPFhirConfig>): SHARPFhirIntegration;
//# sourceMappingURL=sharp-fhir-integration.d.ts.map