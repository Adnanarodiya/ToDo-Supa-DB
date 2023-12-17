import { useState } from "react";
import { useTodo } from "../contexts/TodoContext";
import { supabase } from "../lib/helper/supabaseClient";
function TodoForm({ user }) {
  const [todo, setTodo] = useState("");
  const { addTodo } = useTodo();

  const add = async (e) => {
    e.preventDefault();

    if (!todo) return;
    try {
      await pushTodo({ todo });
      // addTodo({ todo: todo, isCompleted: false });
      setTodo("");
    } catch (error) {
      console.log(error);
    }
  };

  async function pushTodo({ todo }) {
    const { data, error, status } = await supabase
      .from("todos")
      .insert({
        name: todo,
        user_id: user.id,
      })
      .select("*");
    setTodo(data);

    console.log(`Data: ${data}, error: ${error}, Status: ${status}`);
  }

  return (
    <form className="flex" onSubmit={add}>
      <input
        type="text"
        placeholder="Write Todo..."
        className="w-full border border-black/10 rounded-l-lg px-3 outline-none duration-150 bg-white/20 py-1.5"
        value={todo}
        onChange={(e) => setTodo(e.target.value)}
      />
      <button
        type="submit"
        className="rounded-r-lg px-3 py-1 bg-green-600 text-white shrink-0"
      >
        Add
      </button>
    </form>
  );
}

export default TodoForm;
