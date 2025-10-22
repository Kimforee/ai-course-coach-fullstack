type Props={value:number};export default function ProgressBar({value}:Props){const v=Math.max(0,Math.min(100,value));return(<div className='w-full rounded-xl bg-gray-200 h-2'><div className='h-2 rounded-xl bg-blue-600 transition-[width]' style={{width:`${v}%`}}/></div>)}
// type Props = { value: number }

// export default function ProgressBar({ value }: Props) {
//   const v = Math.max(0, Math.min(100, value))
  
//   return (
//     <div className='w-full rounded-xl bg-gray-200 h-2 overflow-hidden'>
//       <div 
//         className='h-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out' 
//         style={{ width: `${v}%` }}
//       />
//     </div>
//   )
// }