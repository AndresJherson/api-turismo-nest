export enum ERROR 
{
    ID_INVALIDATE = 'Id invalido',
    NON_CREATE = 'Ningún dato ha sido creado',
    NON_SELECT = 'Ningún dato ha sido leido',
    NON_UPDATE = 'Ningún dato ha sido actualizado',
    NON_DELETE = 'Ningún dato ha sido eliminado',
}


export enum ERROR_DOCUMENT
{
    DATETIME_ISSUE_INVALIDATE = 'Fecha de emision invalido',
    NON_UPDATE_ISSUED = 'No se puede actualizar un documento emitido',
    NON_UPDATE_CANCELED = 'No se puede actualizar un documento anulado',
    NON_ISSUE_WITHOUT_SERIE = 'No se puede emitir si el código de serie',
}