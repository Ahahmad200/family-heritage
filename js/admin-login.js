import { supabase } from "./supabase.js";


// ===============================
// GET HTML ELEMENTS
// ===============================

const adminLoginForm =
    document.getElementById("adminLoginForm");

const adminEmail =
    document.getElementById("adminEmail");

const adminPassword =
    document.getElementById("adminPassword");

const loginMessage =
    document.getElementById("loginMessage");


// ===============================
// ADMIN LOGIN
// ===============================

adminLoginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        loginMessage.textContent =
            "Logging in...";


        const email =
            adminEmail.value.trim();

        const password =
            adminPassword.value;


        const { data, error } =
            await supabase.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            loginMessage.textContent =
                "Login failed: " +
                error.message;

            return;

        }


        // ===============================
        // CHECK ADMIN ACCOUNT
        // ===============================

        const user =
            data.user;


        const { data: admin, error: adminError } =
            await supabase
                .from("admin_users")
                .select("id")
                .eq(
                    "auth_user_id",
                    user.id
                )
                .maybeSingle();


        if (adminError) {

            console.error(
                "ADMIN CHECK ERROR:",
                adminError
            );

            loginMessage.textContent =
                "Unable to verify administrator account.";

            await supabase.auth.signOut();

            return;

        }


        if (!admin) {

            loginMessage.textContent =
                "Access denied. You are not registered as an administrator.";

            await supabase.auth.signOut();

            return;

        }


        // ===============================
        // SUCCESS
        // ===============================

        loginMessage.textContent =
            "Login successful!";


        window.location.href =
            "admin.html";

    }
);
