import "./App.css";
import { useState, useEffect } from "react";
import { TodoProvider } from "./contexts/TodoContext";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";
import { supabase } from "./lib/helper/supabaseClient";
import { toast } from "react-toastify";
import { z } from "zod";

function App() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then((user) => {
      setUser(user.data.user);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const addTodo = (todo) => {
    setTodos((prevTodos) => [
      ...prevTodos,
      { id: crypto.randomUUID(), ...todo },
    ]);
  };

  const updateTodo = async (id, todo) => {
    setTodos((prevTodos) =>
      prevTodos.map((checkTodo) => (checkTodo.id === id ? todo : checkTodo))
    );

    const { error } = await supabase
      .from("todos")
      .update({ name: todo.name })
      .eq("user_id", user.id)
      .eq("id", id);
    console.log(error);
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id);
    console.log(error);
    // setTodos((prevTodos) =>
    //   prevTodos.filter((checkTodo) => checkTodo.id !== id)
    // );
  };

  const toggleComplete = (id) => {
    console.log(id);
    setTodos((prevTodos) =>
      prevTodos.map((checkTodo) =>
        checkTodo.id === id
          ? { ...checkTodo, isCompleted: !checkTodo.isCompleted }
          : checkTodo
      )
    );
  };

  // Getting TODO from LocalStorage
  // useEffect(() => {
  //   const todos = JSON.parse(localStorage.getItem("todos"));

  //   if (todos && todos.length > 0) {
  //     setTodos(todos);
  //   }
  // }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .then((data) => {
        setTodos(data.data);
        // setTodos(data);
      });
  }, [user, todos]);

  // Storing TODO in LocalStorage
  // useEffect(() => {
  //   localStorage.setItem("todos", JSON.stringify(todos));
  // }, [todos]);

  const login = async (provider) => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  const logout = async () => {
    supabase.auth.signOut();
  };

  async function signInWithEmail() {
    try {
      if (!email.trim()) {
        throw new Error("Email is required");
      }
      const emailSchema = z.string().email();
      const emailParsed = emailSchema.parse(email);

      const herPromise = supabase.auth.signInWithOtp({ email: emailParsed });
      await toast.promise(herPromise, {
        loading: "Sending Email",
        success: "Email Sent 😊",
        error: "Error Sending Email 😢",
      });
      document.getElementById("my_modal_2").close();
    } catch (error) {
      console.log(error);
      toast.error("Invalid Email 😢");
    }
    setEmail("");
  }

  return (
    <TodoProvider
      value={{ todos, addTodo, updateTodo, deleteTodo, toggleComplete }}
    >
      {/* Open the modal using document.getElementById('ID').showModal() method */}

      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-center mb-8 ">
            {user ? "Logout" : "Login"}
          </h3>
          {/* <p className="py-4">Press ESC key or click outside to close</p> */}
          <button
            className="btn  w-full hover:bg-white/70 mb-4 bg-white text-black "
            onClick={user ? logout : () => login("github")}
          >
            <img src="img/github.png" alt="" />
            Login With GitHub
          </button>
          <button
            className="btn  w-full hover:bg-white/70 bg-white mb-4 text-black"
            onClick={user ? logout : () => login("google")}
          >
            <img src="img/google.png" alt="" />
            Login With Google
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              signInWithEmail();
            }}
          >
            <div>
              <label className="form-control w-full mb-4">
                <div className="label">
                  <span className="label-text">Email Address</span>
                </div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input outline-none input-bordered w-full bg-white text-black "
                />
              </label>
            </div>

            <button className="btn  w-full hover:bg-white/70 bg-white/95 mb-4 text-black">
              Submit
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <div className="bg-[#172842] min-h-screen py-8">
        <div className="flex justify-center mb-8">
          <button
            className="bg-green-600 hover:bg-green-600/90 text-black btn"
            onClick={() => {
              if (user) {
                logout();
              } else {
                document.getElementById("my_modal_2").showModal();
              }
            }}
          >
            {user ? "Logout - 😒" : "Login - 😊"}
          </button>
        </div>

        {/* <div>
          <button
            onClick={user ? logout : login}
            className="p-4 bg-white text-black"
          >
            {user ? "Logout" : "Login"}
          </button>
        </div> */}
        {/* <pre>
          <code>{JSON.stringify(user, null, 2)}</code>
        </pre> */}
        <div className="w-full max-w-2xl mx-auto shadow-md rounded-lg px-4 py-3 text-white">
          <h1 className="text-2xl font-bold text-center mb-8 mt-2">
            {user && <span>Welcome {user.user_metadata.name}, </span>}
            Manage your Todos
          </h1>
          <div className="mb-4">
            {/* Todo form goes here */}
            <TodoForm user={user} />
          </div>
          <div className="flex flex-wrap gap-y-3">
            {/*Loop and Add TodoItem here */}
            {todos.map((todo) => (
              <div key={todo.id} className="w-full">
                <TodoItem todo={todo} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </TodoProvider>
  );
}

export default App;
