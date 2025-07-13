import { createTheme } from "@mui/material";

export const Theme = createTheme({
    components:{
        MuiOutlinedInput:{
            styleOverrides:{
                root:{
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor:"black"
                    }
                }
            }
        },
        MuiInputLabel:{
            styleOverrides:{
                root:{
                    "&.Mui-focused":{
                        color:"black"
                    }
                }
            }
        },
        MuiSelect:{
            styleOverrides:{
                select:{
                    "&:focus":{
                        borderColor:"black"
                    }
                }
            }
        }

    }
})