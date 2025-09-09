function Button() {
  const handleClick = () => {
    console.log("Button clicked");
  };

  return (
    <button
      className="bg-red-500 text-white py-[10px] px-[20px] rounded-md cursor-pointer"
      onClick={handleClick}
    >
      Click me
    </button>
  );
}

export default Button;
