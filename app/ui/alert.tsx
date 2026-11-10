// shadcn/ui Alert composition adapted to the existing CSS theme.
import type {ComponentProps} from 'react';
export function Alert({className='',variant='default',...props}:ComponentProps<'div'>&{variant?:'default'|'destructive'}){return <div data-slot="alert" role="alert" className={`ui-alert ${variant} ${className}`} {...props}/>}
export function AlertTitle({className='',...props}:ComponentProps<'div'>){return <div data-slot="alert-title" className={`ui-alert-title ${className}`} {...props}/>}
export function AlertDescription({className='',...props}:ComponentProps<'div'>){return <div data-slot="alert-description" className={`ui-alert-description ${className}`} {...props}/>}
