'use strict';
import './widgets/formBuilder';
import './widgets/arrayField';
import './widgets/dateRangePicker';
import './widgets/dateTimeRangePicker';
import './widgets/dropDownPanel';
import {register} from './types/index';
import allTypes from './types/allTypes';
register(allTypes);