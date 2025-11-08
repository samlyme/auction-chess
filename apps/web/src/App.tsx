import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";

function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [employees, setTodos] = useState<any[]>([]);

  useEffect(() => {
    async function getTodos() {
      const { data  } = await supabase.from("employees").select();

      if (!data) throw new Error("Nothing found!");

      setTodos(data);
    }

    getTodos();
  }, []);

  return (
    <div>
      {employees.map((employee) => {
        console.log(employee);
        return <li key={employee.id}>{employee.name} {employee.email}</li>;
      })}

      <Auth />
    </div>
  );
}
export default App;
