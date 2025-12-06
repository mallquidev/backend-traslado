import jwt from 'jsonwebtoken'
import {JWT_KEY} from '../config.js'

export const authRequerid = (req, res, next) => {
    const {token} = req.cookies
    if(!token) return res.status(401).json({message: 'No Token, Authorization denied'})
    jwt.verify(token, JWT_KEY, (err, user)=>{
        if(err) return res.status(401).json({message: 'INVALID TOKEN'})
        console.log('middlewares respons: ',user)
        req.user = user
    })
    next()
}