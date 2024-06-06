import { MicrophoneIcon } from "@heroicons/react/20/solid"

function MicrophoneSlashIcon({...props}) {
  return (
    <div {...props}>
        <div className="h-full relative flex items-center justify-center">
            <div className="h-[90%] w-[7px] bg-dark rotate-[-45deg] absolute flex items-center justify-center">
                <div className="w-[3px] bg-white h-full rounded-md"></div>
            </div>
            <MicrophoneIcon className="h-full" />
        </div>
    </div>
  )
}

export default MicrophoneSlashIcon