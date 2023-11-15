import { z } from "zod";

export const registerSchema = z.object({
  username: z.string({
    required_error: "El username es requerido",
  }),
  email: z
    .string({
      required_error: "El email es requerido",
    })
    .email({
      message: "Ingrese un mail valido",
    }),
  password: z
    .string({
      required_error: "La contraseña es requerida"
    }),
  dni: z
  .number({
    required_error: "El dni es requerido",
  }).min((6), "Ingrese un dni valido")
});

export const loginSchema = z.object({
  username: z.string({
    required_error: "El username es requerido",
  }),
  password: z.string({
    required_error: "La contraseña es requerida"
  }),
});

export const cardSchema = z.object({
  cardNumber: z.string({
    required_error: "El numero de la tarjeta es requerido",
  }),
  goodTill: z.string({
    required_error:"El numero de vencimiento es requerido"
  }),
  secretCode: z.string({
    required_error:"El codigo de seguridad es requerido"
  }),
  dni: z
  .number({
    required_error: "El dni es requerido",
  }).min((6), "Ingrese un dni valido")

})

export const transferCreditsSchema = z.object({
  userIDReceiver: z.string({
    required_error: "El Id del usuario destino es requerido",
  }),
  userIDSender: z.string({
    required_error: "El Id del usuario remitente es requerido",
  }),
  credit: z.number({
    required_error:"El numero de creditos es requerido"
  }).gt(0, "El monto a transferir tiene que ser mayor a 0")
})

export const addsCreditSchema = z.object({
  cardNumber: z.string({
    required_error: "El numero de la tarjeta es requerido",
  }),
  goodTill: z.string({
    required_error:"El numero de vencimiento es requerido"
  }), 
  secretCode: z.string({required_error: "El numero de seguridad es requerido"}),
  dni: z.number({required_error: "El dni es requerido"}),
  totalAmmount: z.number({required_error: "No se especifica el monto"})
})

export const exchangeBenefitsSchema = z.object({
  dni: z.number({required_error: "El dni es requerido"}),
  idBenefit: z.string({required_error: "Beneficio no especificado"}), 
})

export const userCodeSchema = z.object({
  dni: z.number({required_error: "El dni es requerido"}),
  code: z.number({required_error: "El codigo de verificacion es requerido"}), 
});
export const userResendCodeSchema = z.object({
  dni: z.number({required_error: "El dni es requerido"})
})

export const deleteCardSchema = z.object({
  dni: z.number({required_error: "El dni es requerido"}),
  cardID: z.string({required_error: "El id de la tarjeta a eliminar es requerido"})
})