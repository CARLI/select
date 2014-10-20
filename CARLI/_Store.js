function ensureGetOptionsExist( options ){
    if( !options || !options.id ) {
            throw new Error( 'Requires an id' );
    };
}

function ensureGetOptionsHastype( options ){
    if ( !options.type ){
            throw new Error( 'Requires a type' );
    }
}

function ensureGetOptionsAreValid( options ){
    ensureGetOptionsExist( options );
    ensureGetOptionsHastype( options );
}

function ensureSaveDataArgumentExists( data ) {
    if ( !data ) {
        throw new Error( 'Requires Data' );  
    };
}

function ensureSaveDataHasId( data ) {
    if ( !data.id ){
        throw new Error( 'Requires id property' );
    }
};

function ensureSaveDataHasType( data ) {
    if ( !data.type ){
        throw new Error( 'Requires type property' );
    }
}

function ensureSaveDataIsValid( data ) {
    ensureSaveDataArgumentExists( data );
    ensureSaveDataHasId( data );
    ensureSaveDataHasType( data );
}

module.exports = {
    ensureGetOptionsAreValid: ensureGetOptionsAreValid,
    ensureSaveDataIsValid: ensureSaveDataIsValid 
};
