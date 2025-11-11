function LocationTab(props) {
  const handleClick = () => {
    props.onClick(props.location);
  };

  if (props.location._id === props.selectedLocation) {
    return (
      <div
        className="text-base bg-gray-200 border rounded-full px-2 py-1 cursor-pointer"
        onClick={handleClick}
      >
        {props.location.name}
      </div>
    );
  }

  return (
    <div
      className="text-base  border rounded-full px-2 py-1 cursor-pointer"
      onClick={handleClick}
    >
      {props.location.name}
    </div>
  );
}

export default LocationTab;
