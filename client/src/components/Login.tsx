import React, { useState } from "react";

import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";

import useWindowDimensions from "../hooks/window";

import { api_v1 } from "../api/v1";

function Login(props: { handleChange: Function }) {
  const { height } = useWindowDimensions();

  // create hooks for username and password
  const [form, setForm] = useState({
    userName: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    userName: "",
    password: "",
  });

  /**
   * Validates all input forms except for `confirmPass` input
   * @param regexPattern  pattern to match
   * @param checkString   string to verify
   * @param setHook       set function for the input's hook
   * @param errorMessage  error message to display for that input field
   */
  const validateBlur = (
    regexPattern: RegExp,
    checkString: string,
    setHook: Function,
    errorMessage: string
  ) => {
    // only check for the confirm password field

    if (!regexPattern.test(checkString)) {
      setHook(errorMessage);
    } else {
      setHook("");
    }
  };

  // handle function for submitting username and password
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // no refresh; default

    api_v1
      .post("/users/signin", form)
      .then((response) => {
        window.alert("Signed in!");
      })
      .catch((error) => {
        console.error(error.response.data.message);
        window.alert(`Message: ${error.response.data.message}`);
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleError =
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (msg: string) => {
      return setErrors({
        ...errors,
        [e.target.name]: msg,
      });
    };

  return (
    <Box
      data-testid="LogInTab"
      sx={{
        mx: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      overflow="auto"
      maxHeight={height - 200 > 0 ? height - 200 : 0}
    >
      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign in
      </Typography>
      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
        sx={{ mt: 1 }}
      >
        <TextField
          name="userName"
          margin="normal"
          label="Username"
          onChange={handleChange}
          fullWidth
          required
          onBlur={(e) =>
            validateBlur(
              /^[a-zA-Z0-9]+$/,
              form.userName,
              handleError(e),
              "Please enter a valid username"
            )
          }
          error={errors.userName !== ""}
          helperText={errors.userName}
        />
        <TextField
          name="password"
          margin="normal"
          label="Password"
          onChange={handleChange}
          fullWidth
          required
          type="password"
          onBlur={(e) =>
            validateBlur(
              /.{8,}/,
              form.password,
              handleError(e),
              "Ensure password is 8 characters or longer"
            )
          }
          error={errors.password !== ""}
          helperText={errors.password}
        />
        <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          label="Remember me"
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In
        </Button>
        <Grid container>
          <Grid item xs>
            <Link href="#" variant="body2">
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link
              href="#"
              variant="body2"
              onClick={(e) => props.handleChange(e, 1)}
              data-testid="CreateAccountButton"
            >
              Don't have an account? Sign Up
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Login;
