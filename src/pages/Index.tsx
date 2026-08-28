import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SubAdminView from "./admin/View";
import AllServices from "./admin/AllServices";

function Index() {
    const navigate = useNavigate();

    const adminType = localStorage.getItem("adminType");
    const adminName = localStorage.getItem("adminName");

    useEffect(() => {
        //  Force logout condition
        if (
            adminType === "super admin" &&
            (adminName === "root" || adminName === "admin")
        ) {
            localStorage.clear();
            navigate("/signin", { replace: true });
        }
    }, [adminType, adminName, navigate]);

    //  Prevent rendering if redirect condition met
    if (adminType === "super admin" && adminName === "root") {
        return null;
    }

    return (
        <div>
            {adminType === "super admin" ? (
                <SubAdminView />
            ) : (
                <AllServices />
            )}
        </div>
    );
}

export default Index;
