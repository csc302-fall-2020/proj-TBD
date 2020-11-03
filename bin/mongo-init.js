db.createUser(
        {
            user: "nametbd",
            pwd: "passtbd",
            roles: [
                {
                    role: "readWrite",
                    db: "SDC"
                }
            ]
        }
);
