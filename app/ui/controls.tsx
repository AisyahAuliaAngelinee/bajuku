'use client';

import {useRef, type ReactNode} from 'react';
import {Button} from '@animate-ui/react/primitives/buttons/button';
import {Dialog} from '@animate-ui/react/primitives/radix-ui/dialog';
import {Select as PrimitiveSelect} from '@animate-ui/react/primitives/radix-ui/select';
import {ChevronDown, Check} from 'lucide-react';
export {Button, Dialog};
export {Fade} from '@animate-ui/react/primitives/effects/fade';
export {AlertDialog} from '@animate-ui/react/primitives/radix-ui/alert-dialog';

export function Modal({open,onOpenChange,busy=false,children,className='',id}: {
  open:boolean; onOpenChange:(open:boolean)=>void; busy?:boolean;
  children:ReactNode; className?:string; id?:string;
}) {
  const returnFocus=useRef<HTMLElement|null>(null);
  return <Dialog.Root open={open} onOpenChange={value=>{if(!busy)onOpenChange(value)}}>
    <Dialog.Portal><Dialog.Overlay className="modal-overlay"/>
      <Dialog.Content id={id} className={`modal-content ${className}`} aria-describedby={undefined}
        onOpenAutoFocus={()=>{returnFocus.current=document.activeElement as HTMLElement}}
        onCloseAutoFocus={event=>{event.preventDefault();returnFocus.current?.focus()}}>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

export function Select({value,onValueChange,options,label,disabled=false}: {
  value:string; onValueChange:(value:string)=>void; label:string; disabled?:boolean;
  options:readonly {value:string;label:string}[];
}) {
  return <PrimitiveSelect.Root value={value} onValueChange={next=>{if(options.some(option=>option.value===next))onValueChange(next)}} disabled={disabled}>
    <PrimitiveSelect.Trigger className="select-trigger" aria-label={label}>
      <PrimitiveSelect.Value/><PrimitiveSelect.Icon><ChevronDown size={16}/></PrimitiveSelect.Icon>
    </PrimitiveSelect.Trigger>
    <PrimitiveSelect.Portal><PrimitiveSelect.Content className="select-content" position="popper" sideOffset={5}>
      <PrimitiveSelect.Viewport>{options.map(option=><PrimitiveSelect.Item key={option.value} value={option.value} className="select-item">
        <PrimitiveSelect.ItemText>{option.label}</PrimitiveSelect.ItemText>
        <PrimitiveSelect.ItemIndicator><Check size={15}/></PrimitiveSelect.ItemIndicator>
      </PrimitiveSelect.Item>)}</PrimitiveSelect.Viewport>
    </PrimitiveSelect.Content></PrimitiveSelect.Portal>
  </PrimitiveSelect.Root>;
}
