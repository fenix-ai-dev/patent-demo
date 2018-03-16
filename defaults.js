/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// Default Data //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var server_url = 'https://fenix.law:7483/';
var resources = '1PhJ4dRgJEhW7ajWbQ8vAQYWweI-WaMjByWPiredRR_c';

var process_claims = [
	{
		name: 'method',
		type: 'method',
		form: 'gerund',
		preamble: 'A method of {DESCRIPTION}, comprising:',
		transition: 'the method further comprising',
		summary: 'A method of {DESCRIPTION} is described. The method may include',
	},
	{
		name: 'computer',
		type: 'apparatus',
		form: 'infinitive',
		preamble: 'An apparatus for {DESCRIPTION}, comprising: a processor and a memory storing instructions and in electronic communication with the processor, the processor being configured to execute the instructions to:',
		transition: 'the processor being further configured to execute the instructions to',
		summary: 'An apparatus for {DESCRIPTION} is described. The apparatus may include a processor, memory in electronic communication with the processor, and instructions stored in the memory. The instructions may be operable to cause the processor to',
	},
	{
		name: 'crm',
		type: 'non-transitory computer-readable medium',
		form: 'infinitive',
		preamble: 'A non-transitory computer readable medium storing code for {DESCRIPTION}, the code comprising instructions executable by a processor to:',
		transition: 'the code further comprising instructions executable by the processor to',
		summary: 'A non-transitory computer readable medium storing code for {DESCRIPTION} is described, the code comprising instructions executable by a processor to:',
	},
	{
		name: 'mpf',
		type: 'apparatus',
		form: 'gerund',
		prefix: 'mneans for',
		preamble: 'An apparatus for {DESCRIPTION}, comprising:',
		transition: 'the apparatus further comprising',
		summary: 'An apparatus for {DESCRIPTION} is described. The apparatus may include',
	},
]

var flowchart_boilerplate = 'In some examples, these operations may be performed by a processor executing a set of codes to control functional elements of an apparatus.'
	+ ' Additionally or alternatively, the processes may be performed using special-purpose hardware.'
	+ ' Generally, these operations may be performed according to the methods and processes described in accordance with aspects of the present disclosure.'
	+ ' For example, the operations may be composed of various substeps, or may be performed in conjunction with other operations described herein.';