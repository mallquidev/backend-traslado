import jwt from 'jsonwebtoken'
import {JWT_KEY} from '../config.js'

export function createAccessToken(payload){

    return new Promise((resolve, reject)=>{
        jwt.sign(
            payload,
            JWT_KEY,
            {
                expiresIn: "1d"
            },
            (error, token)=>{
                if(error) reject(error)
                resolve(token)
                
            }
        )
    })
}