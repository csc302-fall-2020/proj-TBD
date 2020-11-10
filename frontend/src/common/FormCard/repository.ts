import axios from 'axios';

import { FormID } from 'utils/sdcTypes';

export const deleteForm = (FormID: FormID) => axios.delete(`/forms/${FormID}`);
