import * as R from "ramda";

export const isValueExist = R.both(
    R.complement(R.isNil),
    R.complement(R.isEmpty)
);
