import { z } from 'zod';
import { AtlasFhirClient } from '../client';
export declare const PatientIdentifierSchema: z.ZodObject<{
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
}>;
export declare const PatientContactSchema: z.ZodObject<{
    relationship: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    name: z.ZodOptional<z.ZodObject<{
        use: z.ZodOptional<z.ZodEnum<["usual", "official", "temp", "nickname", "anonymous", "old"]>>;
        family: z.ZodString;
        given: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        prefix: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        suffix: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        family: string;
        use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
        given?: string[] | undefined;
        prefix?: string[] | undefined;
        suffix?: string[] | undefined;
    }, {
        family: string;
        use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
        given?: string[] | undefined;
        prefix?: string[] | undefined;
        suffix?: string[] | undefined;
    }>>;
    telecom: z.ZodOptional<z.ZodArray<z.ZodObject<{
        system: z.ZodEnum<["phone", "fax", "email", "pager", "url", "sms", "other"]>;
        value: z.ZodString;
        use: z.ZodOptional<z.ZodEnum<["home", "work", "temp", "old", "mobile"]>>;
        rank: z.ZodOptional<z.ZodNumber>;
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
        system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
        use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        rank?: number | undefined;
    }, {
        value: string;
        system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
        use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        rank?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    relationship?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }[] | undefined;
    name?: {
        family: string;
        use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
        given?: string[] | undefined;
        prefix?: string[] | undefined;
        suffix?: string[] | undefined;
    } | undefined;
    telecom?: {
        value: string;
        system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
        use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        rank?: number | undefined;
    }[] | undefined;
}, {
    relationship?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    }[] | undefined;
    name?: {
        family: string;
        use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
        given?: string[] | undefined;
        prefix?: string[] | undefined;
        suffix?: string[] | undefined;
    } | undefined;
    telecom?: {
        value: string;
        system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
        use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        rank?: number | undefined;
    }[] | undefined;
}>;
export declare const PatientSchema: z.ZodObject<{
    resourceType: z.ZodLiteral<"Patient">;
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
    active: z.ZodOptional<z.ZodBoolean>;
    name: z.ZodArray<z.ZodObject<{
        use: z.ZodOptional<z.ZodEnum<["usual", "official", "temp", "nickname", "anonymous", "old"]>>;
        family: z.ZodString;
        given: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        prefix: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        suffix: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
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
        family: string;
        use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        given?: string[] | undefined;
        prefix?: string[] | undefined;
        suffix?: string[] | undefined;
    }, {
        family: string;
        use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        given?: string[] | undefined;
        prefix?: string[] | undefined;
        suffix?: string[] | undefined;
    }>, "many">;
    telecom: z.ZodOptional<z.ZodArray<z.ZodObject<{
        system: z.ZodEnum<["phone", "fax", "email", "pager", "url", "sms", "other"]>;
        value: z.ZodString;
        use: z.ZodOptional<z.ZodEnum<["home", "work", "temp", "old", "mobile"]>>;
        rank: z.ZodOptional<z.ZodNumber>;
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
        system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
        use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        rank?: number | undefined;
    }, {
        value: string;
        system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
        use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        rank?: number | undefined;
    }>, "many">>;
    gender: z.ZodEnum<["male", "female", "other", "unknown"]>;
    birthDate: z.ZodString;
    deceasedBoolean: z.ZodOptional<z.ZodBoolean>;
    deceasedDateTime: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodArray<z.ZodObject<{
        use: z.ZodOptional<z.ZodEnum<["home", "work", "temp", "old", "billing"]>>;
        type: z.ZodOptional<z.ZodEnum<["postal", "physical", "both"]>>;
        text: z.ZodOptional<z.ZodString>;
        line: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        city: z.ZodOptional<z.ZodString>;
        district: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
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
        type?: "postal" | "physical" | "both" | undefined;
        use?: "temp" | "old" | "home" | "work" | "billing" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        text?: string | undefined;
        line?: string[] | undefined;
        city?: string | undefined;
        district?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }, {
        type?: "postal" | "physical" | "both" | undefined;
        use?: "temp" | "old" | "home" | "work" | "billing" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        text?: string | undefined;
        line?: string[] | undefined;
        city?: string | undefined;
        district?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }>, "many">>;
    maritalStatus: z.ZodOptional<z.ZodObject<{
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
    multipleBirthBoolean: z.ZodOptional<z.ZodBoolean>;
    multipleBirthInteger: z.ZodOptional<z.ZodNumber>;
    contact: z.ZodOptional<z.ZodArray<z.ZodObject<{
        relationship: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        name: z.ZodOptional<z.ZodObject<{
            use: z.ZodOptional<z.ZodEnum<["usual", "official", "temp", "nickname", "anonymous", "old"]>>;
            family: z.ZodString;
            given: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            prefix: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            suffix: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            family: string;
            use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
            given?: string[] | undefined;
            prefix?: string[] | undefined;
            suffix?: string[] | undefined;
        }, {
            family: string;
            use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
            given?: string[] | undefined;
            prefix?: string[] | undefined;
            suffix?: string[] | undefined;
        }>>;
        telecom: z.ZodOptional<z.ZodArray<z.ZodObject<{
            system: z.ZodEnum<["phone", "fax", "email", "pager", "url", "sms", "other"]>;
            value: z.ZodString;
            use: z.ZodOptional<z.ZodEnum<["home", "work", "temp", "old", "mobile"]>>;
            rank: z.ZodOptional<z.ZodNumber>;
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
            system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
            use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
            period?: {
                start?: string | undefined;
                end?: string | undefined;
            } | undefined;
            rank?: number | undefined;
        }, {
            value: string;
            system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
            use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
            period?: {
                start?: string | undefined;
                end?: string | undefined;
            } | undefined;
            rank?: number | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        relationship?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }[] | undefined;
        name?: {
            family: string;
            use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
            given?: string[] | undefined;
            prefix?: string[] | undefined;
            suffix?: string[] | undefined;
        } | undefined;
        telecom?: {
            value: string;
            system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
            use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
            period?: {
                start?: string | undefined;
                end?: string | undefined;
            } | undefined;
            rank?: number | undefined;
        }[] | undefined;
    }, {
        relationship?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }[] | undefined;
        name?: {
            family: string;
            use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
            given?: string[] | undefined;
            prefix?: string[] | undefined;
            suffix?: string[] | undefined;
        } | undefined;
        telecom?: {
            value: string;
            system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
            use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
            period?: {
                start?: string | undefined;
                end?: string | undefined;
            } | undefined;
            rank?: number | undefined;
        }[] | undefined;
    }>, "many">>;
    communication: z.ZodOptional<z.ZodArray<z.ZodObject<{
        language: z.ZodObject<{
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
        }>;
        preferred: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        language: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        };
        preferred?: boolean | undefined;
    }, {
        language: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        };
        preferred?: boolean | undefined;
    }>, "many">>;
    generalPractitioner: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>, "many">>;
    managingOrganization: z.ZodOptional<z.ZodObject<{
        reference: z.ZodString;
        display: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        display?: string | undefined;
    }, {
        reference: string;
        display?: string | undefined;
    }>>;
    link: z.ZodOptional<z.ZodArray<z.ZodObject<{
        other: z.ZodObject<{
            reference: z.ZodString;
            display: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            reference: string;
            display?: string | undefined;
        }, {
            reference: string;
            display?: string | undefined;
        }>;
        type: z.ZodEnum<["replaced-by", "replaces", "refer", "seealso"]>;
    }, "strip", z.ZodTypeAny, {
        type: "replaces" | "replaced-by" | "refer" | "seealso";
        other: {
            reference: string;
            display?: string | undefined;
        };
    }, {
        type: "replaces" | "replaced-by" | "refer" | "seealso";
        other: {
            reference: string;
            display?: string | undefined;
        };
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    resourceType: "Patient";
    name: {
        family: string;
        use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        given?: string[] | undefined;
        prefix?: string[] | undefined;
        suffix?: string[] | undefined;
    }[];
    gender: "unknown" | "other" | "male" | "female";
    birthDate: string;
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
    active?: boolean | undefined;
    telecom?: {
        value: string;
        system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
        use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        rank?: number | undefined;
    }[] | undefined;
    deceasedBoolean?: boolean | undefined;
    deceasedDateTime?: string | undefined;
    address?: {
        type?: "postal" | "physical" | "both" | undefined;
        use?: "temp" | "old" | "home" | "work" | "billing" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        text?: string | undefined;
        line?: string[] | undefined;
        city?: string | undefined;
        district?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }[] | undefined;
    maritalStatus?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    multipleBirthBoolean?: boolean | undefined;
    multipleBirthInteger?: number | undefined;
    contact?: {
        relationship?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }[] | undefined;
        name?: {
            family: string;
            use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
            given?: string[] | undefined;
            prefix?: string[] | undefined;
            suffix?: string[] | undefined;
        } | undefined;
        telecom?: {
            value: string;
            system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
            use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
            period?: {
                start?: string | undefined;
                end?: string | undefined;
            } | undefined;
            rank?: number | undefined;
        }[] | undefined;
    }[] | undefined;
    communication?: {
        language: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        };
        preferred?: boolean | undefined;
    }[] | undefined;
    generalPractitioner?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    managingOrganization?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    link?: {
        type: "replaces" | "replaced-by" | "refer" | "seealso";
        other: {
            reference: string;
            display?: string | undefined;
        };
    }[] | undefined;
}, {
    resourceType: "Patient";
    name: {
        family: string;
        use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        given?: string[] | undefined;
        prefix?: string[] | undefined;
        suffix?: string[] | undefined;
    }[];
    gender: "unknown" | "other" | "male" | "female";
    birthDate: string;
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
    active?: boolean | undefined;
    telecom?: {
        value: string;
        system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
        use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        rank?: number | undefined;
    }[] | undefined;
    deceasedBoolean?: boolean | undefined;
    deceasedDateTime?: string | undefined;
    address?: {
        type?: "postal" | "physical" | "both" | undefined;
        use?: "temp" | "old" | "home" | "work" | "billing" | undefined;
        period?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
        text?: string | undefined;
        line?: string[] | undefined;
        city?: string | undefined;
        district?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }[] | undefined;
    maritalStatus?: {
        coding: {
            code: string;
            system: string;
            display?: string | undefined;
        }[];
    } | undefined;
    multipleBirthBoolean?: boolean | undefined;
    multipleBirthInteger?: number | undefined;
    contact?: {
        relationship?: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        }[] | undefined;
        name?: {
            family: string;
            use?: "usual" | "official" | "temp" | "old" | "nickname" | "anonymous" | undefined;
            given?: string[] | undefined;
            prefix?: string[] | undefined;
            suffix?: string[] | undefined;
        } | undefined;
        telecom?: {
            value: string;
            system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
            use?: "temp" | "old" | "home" | "work" | "mobile" | undefined;
            period?: {
                start?: string | undefined;
                end?: string | undefined;
            } | undefined;
            rank?: number | undefined;
        }[] | undefined;
    }[] | undefined;
    communication?: {
        language: {
            coding: {
                code: string;
                system: string;
                display?: string | undefined;
            }[];
        };
        preferred?: boolean | undefined;
    }[] | undefined;
    generalPractitioner?: {
        reference: string;
        display?: string | undefined;
    }[] | undefined;
    managingOrganization?: {
        reference: string;
        display?: string | undefined;
    } | undefined;
    link?: {
        type: "replaces" | "replaced-by" | "refer" | "seealso";
        other: {
            reference: string;
            display?: string | undefined;
        };
    }[] | undefined;
}>;
export type Patient = z.infer<typeof PatientSchema>;
export type PatientIdentifier = z.infer<typeof PatientIdentifierSchema>;
export type PatientContact = z.infer<typeof PatientContactSchema>;
export interface PatientResourceConfig {
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
export declare class PatientResourceError extends Error {
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
export declare class PatientResource {
    private client;
    private config;
    private metrics;
    private logger;
    private tracer;
    private circuitBreaker;
    private retryStrategy;
    private healthChecker;
    constructor(client: AtlasFhirClient, config?: Partial<PatientResourceConfig>);
    create(patient: Patient): Promise<Patient>;
    read(id: string): Promise<Patient>;
    update(patient: Patient): Promise<Patient>;
    delete(id: string): Promise<void>;
    search(params: {
        identifier?: string;
        name?: string;
        family?: string;
        given?: string;
        birthdate?: string;
        gender?: 'male' | 'female' | 'other' | 'unknown';
        address?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        telecom?: string;
        email?: string;
        phone?: string;
        organization?: string;
        _count?: number;
        _page?: number;
    }): Promise<any>;
    findByMrn(mrn: string, system?: string): Promise<any>;
    findByName(name: string, exact?: boolean): Promise<any>;
    getDemographics(id: string): Promise<{
        name: string;
        birthDate: string;
        gender: string;
        primaryIdentifier: string;
    }>;
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
export declare function createPatientResource(client: AtlasFhirClient, config?: Partial<PatientResourceConfig>): PatientResource;
export {};
//# sourceMappingURL=Patient.d.ts.map