import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import axios from "axios";
import { setIsAuthenticated  } from "../../redux/authentication.js";
import { useSelector, useDispatch } from 'react-redux'

export default function Google() {
    const authentication = useSelector(state => state.authentication.value)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setIsAuthenticated(true))
         
    }, [])
    return (
        <>
            google logged in
        </>
    )
}