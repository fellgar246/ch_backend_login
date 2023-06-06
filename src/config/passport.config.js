import passport from "passport";
import local from "passport-local";
import userModel from "../dao/mongo/models/user.js";
import { createHash, validatePassword } from "../utils.js";

const LocalStrategy = local.Strategy;

const initializePassport = () => {
    passport.use('register', new LocalStrategy({passReqToCallback:true, usernameField: 'email'}, async(req, email, password, done) => {
        
        try {
            const {first_name, last_name } = req.body;

            const exists = await userModel.findOne({email});
            if(exists) return done(null,false,{message:'El usuario ya existe'});
    
            const hashedPassword = await createHash(password);
            const user = {
                first_name,
                last_name,
                email,
                password: hashedPassword
            }
    
            const result = await userModel.create(user);
            done(null,result);
        } catch (error) {
            done(error);
        }

    }));

    passport.use('login', new LocalStrategy({usernameField:'email'},async(email, password, done)=> {

        if(email==="adminCoder@coder.com" && password==="adminCod3r123"){
            const user = {
                id:0,
                name: 'Admin',
                role: 'admin',
                email: 'adminCoder@coder.com'
            }
            return done(null,user)
        }

        let user;
    
        user = await userModel.findOne({email});
        if(!user) return done(null,false,{message: "Credenciales incorrectas"})
    
        const isValidPassword = await validatePassword(password, user.password);
        if(!isValidPassword) return done(null,false,{message:"Contraseña inválida"})
    
        user = {
            id: user._id,
            name: `${user.first_name} ${user.last_name}`,
            email:user.email,
            role:user.role
        }

        return done(null, user);
    }));

    passport.serializeUser(function(user,done){
        return done(null, user.id);
    });
    passport.deserializeUser(async function(id,done){
        if(id===0){
            return done(null,{
                role:"admin",
                name:"ADMIN"
            })
        }
        const user = await userModel.findOne({_id: id});
        return done(null, user);
    });
}


export default initializePassport;