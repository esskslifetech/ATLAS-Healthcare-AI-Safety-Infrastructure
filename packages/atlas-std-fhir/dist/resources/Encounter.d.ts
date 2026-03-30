import { z } from 'zod';
import { AtlasFhirClient } from '../client';
export declare const EncounterStatusHistorySchema: z.ZodObject<{
    status: z.ZodEnum<["planned", "arrived", "triaged", "in-progress", "onleave", "finished", "cancelled", "entered-in-error", "unknown"]>;
    period: z.ZodObject<{
        start: z.ZodOptional<z.ZodString>;
        end: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        start?: string | undefined;
        end?: string | undefined;
    }, {
        start?: string | undefined;
        end?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    status: "unknown" | "entered-in-error" | "planned" | "arrived" | "triaged" | "in-progress" | "onleave" | "finished" | "cancelled";
    period: {
        start?: string | undefined;
        end?: string | undefined;
    };
}, {
    status: "unknown" | "entered-in-error" | "planned" | "arrived" | "triaged" | "in-progress" | "onleave" | "finished" | "cancelled";
    period: {
        start?: string | undefined;
        end?: string | undefined;
    };
}>;
export declare const EncounterClassHistorySchema: z.ZodObject<{
    class: z.ZodObject<{
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
    }>;
    period: z.ZodObject<{
        start: z.ZodOptional<z.ZodString>;
        end: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        start?: string | undefined;
        end?: string | undefined;
    }, {
        start?: string | undefined;
        end?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    period: {
        start?: string | undefined;
        end?: string | undefined;
    };
    class: {
        code: string;
        system: string;
        display?: string | undefined;
    };
}, {
    period: {
        start?: string | undefined;
        end?: string | undefined;
    };
    class: {
        code: string;
        system: string;
        display?: string | undefined;
    };
}>;
export declare const EncounterHospitalizationSchema: z.ZodObject<{
    preAdmissionIdentifier: z.ZodOptional<z.ZodObject<{
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
    }>>;
    origin: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    admitSource: z.ZodOptional<z.ZodObject<{
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
    reAdmission: z.ZodOptional<z.ZodObject<{
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
    dietPreference: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    specialCourtesy: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    specialArrangement: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    destination: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    dischargeDisposition: z.ZodOptional<z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    preAdmissionIdentifier?: {
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
    } | undefined;
    origin?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    admitSource?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    reAdmission?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    dietPreference?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    specialCourtesy?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    specialArrangement?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    destination?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    dischargeDisposition?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
}, {
    preAdmissionIdentifier?: {
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
    } | undefined;
    origin?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    admitSource?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    reAdmission?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    dietPreference?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    specialCourtesy?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    specialArrangement?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    destination?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    dischargeDisposition?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
}>;
export declare const EncounterLocationSchema: z.ZodObject<{
    location: z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>;
    status: z.ZodEnum<["active", "reserved", "completed", "planned"]>;
    physicalType: z.ZodOptional<z.ZodObject<{
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
    status: "active" | "completed" | "planned" | "reserved";
    location: {
        reference: string;
        display?: string | undefined;
    };
    period?: {
        start?: string | undefined;
        end?: string | undefined;
    } | undefined;
    physicalType?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
}, {
    status: "active" | "completed" | "planned" | "reserved";
    location: {
        reference: string;
        display?: string | undefined;
    };
    period?: {
        start?: string | undefined;
        end?: string | undefined;
    } | undefined;
    physicalType?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
}>;
export declare const EncounterSchema: z.ZodObject<{
    resourceType: z.ZodLiteral<"Encounter">;
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
    status: z.ZodEnum<["planned", "arrived", "triaged", "in-progress", "onleave", "finished", "cancelled", "entered-in-error", "unknown"]>;
    statusReason: z.ZodOptional<z.ZodObject<{
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
    class: z.ZodObject<{
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
    }>;
    classHistory: z.ZodOptional<z.ZodArray<z.ZodObject<{
        class: z.ZodObject<{
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
        }>;
        period: z.ZodObject<{
            start: z.ZodOptional<z.ZodString>;
            end: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            start?: string | undefined;
            end?: string | undefined;
        }, {
            start?: string | undefined;
            end?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        period: {
            start?: string | undefined;
            end?: string | undefined;
        };
        class: {
            code: string;
            system: string;
            display?: string | undefined;
        };
    }, {
        period: {
            start?: string | undefined;
            end?: string | undefined;
        };
        class: {
            code: string;
            system: string;
            display?: string | undefined;
        };
    }>, "many">>;
    type: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    serviceType: z.ZodOptional<z.ZodObject<{
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
    priority: z.ZodOptional<z.ZodNumber>;
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
    episodeOfCare: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
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
    participant: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodArray<z.ZodObject<{
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
        }>, "many">;
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
        individual: z.ZodObject<{
            reference: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            reference: string;
            display?: string | undefined;
        }, {
            reference: string;
            display?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[];
        individual: {
            reference: string;
            display?: string | undefined;
        };
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }, {
        type: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[];
        individual: {
            reference: string;
            display?: string | undefined;
        };
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }>, "many">>;
    appointment: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
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
    length: z.ZodOptional<z.ZodObject<{
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
    reasonCode: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    reasonReference: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    diagnosis: z.ZodOptional<z.ZodArray<z.ZodObject<{
        condition: z.ZodObject<{
            reference: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            reference: string;
            display?: string | undefined;
        }, {
            reference: string;
            display?: string | undefined;
        }>;
        use: z.ZodOptional<z.ZodObject<{
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
        rank: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        condition: {
            reference: string;
            display?: string | undefined;
        };
        use?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        rank?: number | undefined;
    }, {
        condition: {
            reference: string;
            display?: string | undefined;
        };
        use?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        rank?: number | undefined;
    }>, "many">>;
    account: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    hospitalization: z.ZodOptional<z.ZodObject<{
        preAdmissionIdentifier: z.ZodOptional<z.ZodObject<{
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
        }>>;
        origin: z.ZodOptional<z.ZodObject<{
            reference: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            reference: string;
            display?: string | undefined;
        }, {
            reference: string;
            display?: string | undefined;
        }>>;
        admitSource: z.ZodOptional<z.ZodObject<{
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
        reAdmission: z.ZodOptional<z.ZodObject<{
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
        dietPreference: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        specialCourtesy: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        specialArrangement: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        destination: z.ZodOptional<z.ZodObject<{
            reference: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            reference: string;
            display?: string | undefined;
        }, {
            reference: string;
            display?: string | undefined;
        }>>;
        dischargeDisposition: z.ZodOptional<z.ZodObject<{
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
    }, "strip", z.ZodTypeAny, {
        preAdmissionIdentifier?: {
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
        } | undefined;
        origin?: {
            reference: string;
            display?: string | undefined;
        } | undefined;
        admitSource?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        reAdmission?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        dietPreference?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        specialCourtesy?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        specialArrangement?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        destination?: {
            reference: string;
            display?: string | undefined;
        } | undefined;
        dischargeDisposition?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
    }, {
        preAdmissionIdentifier?: {
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
        } | undefined;
        origin?: {
            reference: string;
            display?: string | undefined;
        } | undefined;
        admitSource?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        reAdmission?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        dietPreference?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        specialCourtesy?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        specialArrangement?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        destination?: {
            reference: string;
            display?: string | undefined;
        } | undefined;
        dischargeDisposition?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
    }>>;
    location: z.ZodOptional<z.ZodArray<z.ZodObject<{
        location: z.ZodObject<{
            reference: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            reference: string;
            display?: string | undefined;
        }, {
            reference: string;
            display?: string | undefined;
        }>;
        status: z.ZodEnum<["active", "reserved", "completed", "planned"]>;
        physicalType: z.ZodOptional<z.ZodObject<{
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
        status: "active" | "completed" | "planned" | "reserved";
        location: {
            reference: string;
            display?: string | undefined;
        };
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        physicalType?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
    }, {
        status: "active" | "completed" | "planned" | "reserved";
        location: {
            reference: string;
            display?: string | undefined;
        };
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        physicalType?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
    }>, "many">>;
    serviceProvider: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    partOf: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: "unknown" | "entered-in-error" | "planned" | "arrived" | "triaged" | "in-progress" | "onleave" | "finished" | "cancelled";
    resourceType: "Encounter";
    class: {
        code: string;
        system: string;
        display?: string | undefined;
    };
    type?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    length?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    id?: string | undefined;
    period?: {
        start?: string | undefined;
        end?: string | undefined;
    } | undefined;
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
    priority?: number | undefined;
    subject?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    reasonCode?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    reasonReference?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    location?: {
        status: "active" | "completed" | "planned" | "reserved";
        location: {
            reference: string;
            display?: string | undefined;
        };
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        physicalType?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
    }[] | undefined;
    statusReason?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    classHistory?: {
        period: {
            start?: string | undefined;
            end?: string | undefined;
        };
        class: {
            code: string;
            system: string;
            display?: string | undefined;
        };
    }[] | undefined;
    serviceType?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    episodeOfCare?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    participant?: {
        type: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[];
        individual: {
            reference: string;
            display?: string | undefined;
        };
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }[] | undefined;
    appointment?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    diagnosis?: {
        condition: {
            reference: string;
            display?: string | undefined;
        };
        use?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        rank?: number | undefined;
    }[] | undefined;
    account?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    hospitalization?: {
        preAdmissionIdentifier?: {
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
        } | undefined;
        origin?: {
            reference: string;
            display?: string | undefined;
        } | undefined;
        admitSource?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        reAdmission?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        dietPreference?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        specialCourtesy?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        specialArrangement?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        destination?: {
            reference: string;
            display?: string | undefined;
        } | undefined;
        dischargeDisposition?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
    } | undefined;
    serviceProvider?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    partOf?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
}, {
    status: "unknown" | "entered-in-error" | "planned" | "arrived" | "triaged" | "in-progress" | "onleave" | "finished" | "cancelled";
    resourceType: "Encounter";
    class: {
        code: string;
        system: string;
        display?: string | undefined;
    };
    type?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    length?: {
        value: number;
        unit: string;
        code?: string | undefined;
        system?: string | undefined;
    } | undefined;
    id?: string | undefined;
    period?: {
        start?: string | undefined;
        end?: string | undefined;
    } | undefined;
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
    priority?: number | undefined;
    subject?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    reasonCode?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    }[] | undefined;
    reasonReference?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    location?: {
        status: "active" | "completed" | "planned" | "reserved";
        location: {
            reference: string;
            display?: string | undefined;
        };
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        physicalType?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
    }[] | undefined;
    statusReason?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    classHistory?: {
        period: {
            start?: string | undefined;
            end?: string | undefined;
        };
        class: {
            code: string;
            system: string;
            display?: string | undefined;
        };
    }[] | undefined;
    serviceType?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
        text?: string | undefined;
    } | undefined;
    episodeOfCare?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    participant?: {
        type: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[];
        individual: {
            reference: string;
            display?: string | undefined;
        };
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }[] | undefined;
    appointment?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    diagnosis?: {
        condition: {
            reference: string;
            display?: string | undefined;
        };
        use?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        rank?: number | undefined;
    }[] | undefined;
    account?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    hospitalization?: {
        preAdmissionIdentifier?: {
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
        } | undefined;
        origin?: {
            reference: string;
            display?: string | undefined;
        } | undefined;
        admitSource?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        reAdmission?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
        dietPreference?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        specialCourtesy?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        specialArrangement?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        }[] | undefined;
        destination?: {
            reference: string;
            display?: string | undefined;
        } | undefined;
        dischargeDisposition?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
            text?: string | undefined;
        } | undefined;
    } | undefined;
    serviceProvider?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    partOf?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
}>;
export type Encounter = z.infer<typeof EncounterSchema>;
export type EncounterStatusHistory = z.infer<typeof EncounterStatusHistorySchema>;
export type EncounterClassHistory = z.infer<typeof EncounterClassHistorySchema>;
export type EncounterHospitalization = z.infer<typeof EncounterHospitalizationSchema>;
export type EncounterLocation = z.infer<typeof EncounterLocationSchema>;
export interface EncounterResourceConfig {
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
export declare class EncounterResourceError extends Error {
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
    encounterId?: string;
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
export declare class EncounterResource {
    private client;
    private config;
    private metrics;
    private logger;
    private tracer;
    private circuitBreaker;
    private retryStrategy;
    private healthChecker;
    constructor(client: AtlasFhirClient, config?: Partial<EncounterResourceConfig>);
    create(encounter: Encounter): Promise<Encounter>;
    read(id: string): Promise<Encounter>;
    update(encounter: Encounter): Promise<Encounter>;
    delete(id: string): Promise<void>;
    search(params: {
        patient?: string;
        subject?: string;
        status?: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown';
        class?: string;
        type?: string;
        service_type?: string;
        location?: string;
        date?: string;
        identifier?: string;
        _count?: number;
        _page?: number;
    }): Promise<any>;
    getPatientEncounters(patientId: string, status?: string): Promise<any>;
    createEmergencyEncounter(params: {
        patientId: string;
        arrivalDateTime: string;
        reasonForVisit?: string;
        priority?: number;
        locationId?: string;
        practitionerId?: string;
    }): Promise<Encounter>;
    updateStatus(encounterId: string, status: Encounter['status'], statusReason?: string): Promise<Encounter>;
    addParticipant(encounterId: string, participant: {
        practitionerId: string;
        type: {
            system: string;
            code: string;
            display?: string;
        };
    }): Promise<Encounter>;
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
export declare function createEncounterResource(client: AtlasFhirClient, config?: Partial<EncounterResourceConfig>): EncounterResource;
export {};
//# sourceMappingURL=Encounter.d.ts.map