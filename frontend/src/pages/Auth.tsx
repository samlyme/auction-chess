import { useEffect } from "react";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import { Field, Form, Tabs } from "@base-ui-components/react";

import styles from "../index.module.css";

export default function Auth() {
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) navigate("/lobbies")
    })

    return (
        <div className="auth-page">
            <Tabs.Root className={styles.Tabs}>
                <Tabs.List className={styles.List}>
                    <Tabs.Tab className={styles.Tab} value={"login"}>Login</Tabs.Tab>
                    <Tabs.Tab className={styles.Tab} value={"signup"}>Sign Up</Tabs.Tab>
                    <Tabs.Indicator className={styles.Indicator}/>

                </Tabs.List>

                <Tabs.Panel className={styles.Panel} value={"login"}>
                    <Login />
                </Tabs.Panel>
                <Tabs.Panel className={styles.Panel} value={"singup"}>
                    <Signup />
                </Tabs.Panel>
            </Tabs.Root>
        </div>
    )
}

function Login() {
    return (
        <Form className={styles.Form}>
            <Field.Root className={styles.Field} name="username">
                <Field.Label className={styles.Label}>Username</Field.Label>
                <Field.Control
                    className={styles.Input}
                    type="text"
                    // defaultValue="johnsmith"
                    placeholder="johnsmith"
                />
            </Field.Root>

            <Field.Root className={styles.Field} name="password">
                <Field.Label className={styles.Label}>Password</Field.Label>
                <Field.Control
                    className={styles.Input}
                    type="password"
                    // defaultValue="johnsmith"
                    placeholder="asdf123"
                />
            </Field.Root>
            <button type="submit">
                Submit
            </button>
        </Form>
    )
}

function Signup() {
    return (
        <Form>
            <Field.Root>
                <Field.Label>Username</Field.Label>
                <Field.Control
                    type="text"
                    // defaultValue="johnsmith"
                    placeholder="johnsmith"
                />
                <Field.Label>Password</Field.Label>
                <Field.Control
                    type="Password"
                    // defaultValue="johnsmith"
                    placeholder="johnsmith"
                />
                <Field.Error />
            </Field.Root>
            <button type="submit">
                Submit
            </button>
        </Form>
    )
}