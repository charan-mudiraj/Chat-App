import { XMarkIcon } from "@heroicons/react/20/solid";

export default function Close(props: any) {
  return (
    <button
      className=" rounded-lg hover:opacity-100 opacity-40 ease-in-out duration-150"
      {...props}
    >
      <XMarkIcon className="h-6" />
    </button>
  );
}
