import express from "express";
import "dotenv/config";
import db from "./database/db.js";


const app = express();
app.use(express.json());

db.connect((error) => {
  if (error) {
    throw error;
  }
  console.log(`Connected to MYSQL database`);
  db.query(`USE employee_db;`);
});

//create an employee and register relatives

app.post("/api/v1/employees", (req, res) => {
  console.log(req.body);

  const { employee, primary, secondary } = req.body;
  db.beginTransaction((err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    db.query("insert into Employee set ?", employee, (err, result) => {
      if (err) {
        db.rollback(() => {
          res.status(500).json({ error: err.message });
        });

        return;
      }

      const eid = result.insertId;

      //Insert relatives
      primary.EID = eid;
      secondary.EID = eid;

      

      db.query(
        "insert into relative set ?",
        primary,
        (err, result) => {
          if (err) {
            db.rollback(() => {
              res.status(500).json({ error: err.message });
            });
            return;
          }
      db.query(
        "insert into relative set ?",
        secondary,
        (err, result) => {
          if (err) {
            db.rollback(() => {
              res.status(500).json({ error: err.message });
            });
            return;
          }
        
          db.commit((err) => {
            if (err) {
              db.rollback(() => {
                relative.status(500).json({ error: err.message });
              });
            } else {
              res
                .status(201)
                .json({ message: "Employee created", employeeId: eid });
            }
          });
        });
    });
  });
});
});

// GET an employee by eid

app.get("/api/v1/employees/:eid", (req, res) => {
  const eid = req.params.eid;
  db.query("select * from employee where eid=?", eid, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: "Employee not found" });
    } else {
        const eid=results[0].EID;
        db.query("select * from relative where eid=?",eid, (err,relatives) =>{
            if (err) {
                res.status(500).json({ error: err.message });
                return;
              }
          
              if (relatives.length === 0) {
                res.status(404).json({ message: "Relative not found" });
              } else {
                
                res.json({ employee: results[0], relative: relatives });
              }

        });
    }
  });
});

//Read all employees

app.get("/api/v1/employees", (req, res) => {
    const { page, pageSize } = req.query;
    const currentPage = parseInt(page) || 1; //Default page offset is 1
    const limit = parseInt(pageSize) || 10; // Default page size is 10

    const offset = (currentPage - 1) * limit;

    db.query('SELECT * FROM Employee LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }




    res.json({ employees: results });
  });
});

//update an employee by employee id

app.put("/api/v1/employees/:eid", (req, res) => {
  const eid = req.params.eid*1;
  const {employee} = req.body;
  db.query(
    "Update employee set ? where eid = ?",
    [employee, eid],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: "Employee updated",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// Delete an empployee by eid

app.delete("/api/v1/employees/:eid", (req, res) => {
  const eid = req.params.eid;

  db.query("delete from employee where eid =?", eid, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Employee deleted",
      affectedRows: result.affectedRows,
    });
  });
});

//starting the server

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
