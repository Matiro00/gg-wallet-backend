import User from "../models/user.model.js";
import Card from "../models/card.model.js";
import Benefits from "../models/benefits.model.js";
import BenefitsRedeemed from "../models/benefitsRedeemed.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { TOKEN_SECRET } from "../config.js";
import { createAccessToken } from "../utils/jwt.js";
import NodeMailer from 'nodemailer'
const MAX_DAYS_VALIDATE_PERMITED = 7
export const transporter = NodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ggwallettest@gmail.com',
    pass: 'pttp hecu paym jvuz'
  }
});
export const register = async (req, res) => {
  try {
    const { username, email, password, dni } = req.body;

    const emailFound = await User.findOne({ email: email });
    if (emailFound)
      return res.status(400).json({
        message: ["El mail ya esta registrado"],
      });
    const usernameFound = await User.findOne({ username: username });
    if (usernameFound)
      return res.status(400).json({
        message: ["El nombre de usuario ya esta registrado"],
      });
    const dniFound = await User.findOne({ dni: dni });
    if (dniFound)
      return res.status(400).json({
        message: ["El dni ya esta registrado"],
      });
    const passwordHash = await bcrypt.hash(password, 10);
    const ggwcbu = 'GG-' + username + '#' + Math.floor(Math.random() * 10001);
    const code = Math.floor(1000 + Math.random() * 9000);
    const codeHash = await bcrypt.hash(code.toString(), 10)
    const newUser = new User({
      username,
      email,
      password: passwordHash,
      dni,
      credits: 0,
      ggwcbu,
      valid: false,
      code: codeHash,
      lastValidated: null
    });
    const userCreated = await newUser.save();
    const mailOptions = {
      from: 'ggwallettest@gmail.com',
      to: userCreated.email,
      subject: 'Codigo de verificacion',
      text: code.toString()
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        return res.status(500).json({ message: err });
      }
    });
    return res.status(200).json({
      user: {
        username: userCreated.username,
        email: userCreated.email,
        dni: userCreated.dni,
        credits: userCreated.credits,
        ggwcbu: userCreated.ggwcbu,
        valid: userCreated.valid,

      }, message: 'Usuario creado, verifique su mail e ingrese el codigo de verificacion'
    })
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    let userFound = await User.findOne({ username });
    if (!userFound)
      return res.status(400).json({
        message: ["Las credenciales ingresadas son invalidas"],
      });

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({
        message: ["Las credenciales ingresadas son invalidas"],
      });
    }
    const diffDays = Math.ceil(Math.abs(new Date() - userFound.lastValidated) / (1000 * 60 * 60 * 24));
    if (diffDays >= MAX_DAYS_VALIDATE_PERMITED) {
      await User.findOneAndUpdate({ dni: userFound.dni }, { valid: false });
      userFound.valid = false;
    }
    if (userFound.valid) {
      const token = await createAccessToken({
        id: userFound._id,
        username: userFound.username,
      });
      res.cookie("token", token);

      return res.status(200).json({
        user: {
          username: userFound.username,
          email: userFound.email,
          dni: userFound.dni,
          credits: userFound.credits,
          ggwcbu: userFound.ggwcbu,
          valid: userFound.valid,
        }, message: 'Usuario logeado con exito'
      });
    }
    else {
      const code = Math.floor(1000 + Math.random() * 9000);
      const codeHash = await bcrypt.hash(code.toString(), 10);
      await User.findOneAndUpdate({ dni: userFound.dni }, { code: codeHash });
      const mailOptions = {
        from: 'ggwallettest@gmail.com',
        to: userFound.email,
        subject: 'Codigo de verificacion',
        text: code.toString()
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          return res.status(500).json({ message: err });
        }
      });
      return res.status(202).json({
        user: {
          username: userFound.username,
          email: userFound.email,
          dni: userFound.dni,
          credits: userFound.credits,
          ggwcbu: userFound.ggwcbu,
          valid: userFound.valid,
        }, message: 'Verifique su mail e ingrese el codigo de verificacion'
      })
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const verifyEmail = async (req, res) => {
  const { dni, code } = req.body;
  const userFound = await User.findOne({ dni });
  if (await bcrypt.compare(code.toString(), userFound.code)) {
    await User.findOneAndUpdate({ dni: userFound.dni }, { code: null, valid: true, lastValidated: new Date() });
    const token = await createAccessToken({
      id: userFound._id,
      username: userFound.username,
    });
    res.cookie("token", token);

    res.status(200).json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
    });
  }
  else {
    return res.status(400).json({ message: "Codigo invalido" });
  }
};

export const resendCode = async (req, res) => {
  const { dni } = req.body;
  const userFound = await User.findOne({ dni });
  const code = Math.floor(1000 + Math.random() * 9000);
  const codeHash = await bcrypt.hash(code.toString(), 10);
  await User.findOneAndUpdate({ dni: userFound.dni }, { code: codeHash });
  if (!userFound) return res.status(400).json({ message: ["El username ingresado no esta registrado"], });
  if (userFound.valid) {
    return res.status(400).json({ message: ["El usuario esta validado por lo que no necesita reenviar codigo de verificacion"], });
  }
  const mailOptions = {
    from: 'ggwallettest@gmail.com',
    to: userFound.email,
    subject: 'Codigo de verificacion',
    text: code.toString()
  };
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      return res.status(500).json({ message: err });
    }
  });
  return res.status(200).json({ message: 'Codigo reenviado: Verifique su mail e ingrese el codigo de verificacion' })
}

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.send(false);

  jwt.verify(token, TOKEN_SECRET, async (error, user) => {
    if (error) return res.sendStatus(401);

    const userFound = await User.findById(user.id);
    if (!userFound) return res.sendStatus(401);

    return res.json({
      username: userFound.username,
      email: userFound.email,
      dni: userFound.dni,
      credits: userFound.credits,
      ggwcbu: userFound.ggwcbu,
      valid: userFound.valid,
    });
  });
};

export const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

export const transferCredit = async (req, res) => {
  try {
    const { userIDReceiver, userIDSender, credit } = req.body;
    const userReceiverFound = await User.findOne({ ggwcbu: userIDReceiver });
    if (userIDReceiver === userIDSender) {
      return res.status(400).json({
        message: ["No puede enviarse creditos a su propia cuenta"],
      });
    }
    if (!userReceiverFound)
      return res.status(400).json({
        message: ["No existe el ID del usuario destino"],
      });
    const userSenderFound = await User.findOne({ ggwcbu: userIDSender });
    if (!userSenderFound)
      return res.status(400).json({
        message: ["No existe el ID del usuario origen"],
      });
    if (userSenderFound.credits - credit < 0) {
      return res.status(400).json({
        message: ["No hay credito suficiente"],
      });
    }
    await User.findOneAndUpdate({ ggwcbu: userIDReceiver }, { credits: userReceiverFound.credits + credit })
    await User.findOneAndUpdate({ ggwcbu: userIDSender }, { credits: userSenderFound.credits - credit })
    res.status(200).json({ message: "Creditos transferidos" })
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const addNewCard = async (req, res) => {
  try {
    const { cardNumber, goodTill, secretCode, dni } = req.body;
    const userFound = await User.findOne({ dni: dni })
    if (!userFound) return res.status(400).json({ message: 'El dni ingresado no esta registrado' });
    const listCardRegistered = await Card.find({ cardNumber: cardNumber })
    if(listCardRegistered.length > 0) {
      return res.status(400).json({ message: 'La tarjeta ya esta registrada' });
    }
    const secretCodeEncrypt = await bcrypt.hash(secretCode, 10);
    const goodTillSaved= goodTill.slice(-2)+goodTill.substring(0,2)
    const newCard = new Card({
      cardNumber: cardNumber,
      goodTill: goodTillSaved,
      secretCode: secretCodeEncrypt,
      lastFourNumbers: cardNumber.slice(-4),
      dni
    });
    await newCard.save()
    res.status(200).json({ newCard });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
export const showCards = async (req, res) => {
  try {
    const { dni } = req.query;
    const cardsList = await Card.find({ dni: dni })
    if (cardsList.length > 0) {
      res.status(200).json({ cards: cardsList })
    }
    else {
      res.status(204).json({ message: "No tenes tarjetas registradas" })
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const deleteCard = async (req, res) => {
  try {
    const { dni, cardID } = req.body;
    const cardFound = await Card.findOneAndDelete({ dni: dni, _id: cardID })
    if (cardFound) {
      res.status(200).json({ message: 'La tarjeta ingresada ha sido desvinculada' });
    }
    else {
      res.status(400).json({ message: 'Dni o Id de la tarjeta invalidos' });
    }
  }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const addsCredit = async (req, res) => {
  try {
    const { cardNumber, goodTill, secretCode, totalAmmount, dni } = req.body;
    const userFound = await User.findOne({ dni: dni });
    if (!userFound)
      return res.status(400).json({
        message: ["No existe usuario registrado con ese DNI"],
      });
    const cardFound = await Card.find({ dni: dni });
    if (!cardFound)
      return res.status(400).json({
        message: ["No esta registrado la tarjeta ingresada"],
      });
    let result = false;
    for (let index = 0; index < cardFound.length; index++) {
      const element = cardFound[index];
      const secureCodeLegit = await bcrypt.compare(secretCode, element.secretCode);
      if (cardNumber === element.cardNumber && secureCodeLegit && goodTill === element.goodTill) {
        const totalUpdated = userFound.credits + totalAmmount * 0.05;
        await User.findByIdAndUpdate(userFound._id, { credits: totalUpdated });
        result = true;
      }
    }
    if (result) {

      return res.status(200).json({ message: "Creditos acreditados" })
    }
    else {

      return res.status(400).json({ message: "Tarjeta invalida" })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: error.message
    });
  }
}

export const showBenefits = async (req, res) => {
  try {
    const benefitsList = await Benefits.find({})
    if (benefitsList.length > 0) {
      res.status(200).json({ benefitsList })
    }
    else {
      res.status(204).json({ message: "No hay beneficios disponibles" })
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
export const showBenefitsRedeemed = async (req, res) => {
  try {
    const { dni } = req.query;
    const userFound = await User.findOne({ dni: dni });
    if (!userFound) return res.status(400).json({ message: 'El dni ingresado no esta registrado' });
    const benefitsList = await BenefitsRedeemed.find({ dni: dni })
    if (benefitsList.length > 0) {
      res.status(200).json({ benefitsList })
    }
    else {
      res.status(204).json({ message: "No canjeaste ningun beneficio aun" })
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const exchangeBenefits = async (req, res) => {
  try {
    const { dni, idBenefit } = req.body;
    const userFound = await User.findOne({ dni: dni });
    if (!userFound) return res.status(400).json({ message: 'El dni ingresado no esta registrado' });
    const benefit = await Benefits.findById(idBenefit)
    if (!benefit) return res.status(400).json({ message: 'El beneficio seleccionado no esta registrado' });
    if (userFound.credits >= benefit.price) {
      await User.findOneAndUpdate({ dni: dni }, { credits: userFound.credits - benefit.price })
      await Benefits.findByIdAndUpdate(benefit._id, { ammountAvailable: benefit.ammountAvailable - 1 })
      const newBenefitsRedeemed = new BenefitsRedeemed({
        dni: userFound.dni,
        idBenefit: idBenefit,
        title: benefit.name,
        price: benefit.price
      })
      await newBenefitsRedeemed.save()
      const mailOptions = {
        from: 'ggwallettest@gmail.com',
        to: userFound.email,
        subject: 'GGWallet- Canjeo de codigo por beneficio',
        text: 'Felicidades por canjear ' + benefit.name + ' por ' + benefit.price + ' creditos, su codigo es el siguiente ' + Math.floor(Math.random() * 10000001)
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          return res.status(500).json({ message: err });
        }
      });
      res.status(200).json({ message: "Beneficios canjeados" })
    }
    else {
      res.status(400).json({ message: "No tiene los creditos suficientes" })
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}