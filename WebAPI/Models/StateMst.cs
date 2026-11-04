namespace HRMSWebAPI.Models
{
    public class StateMst
    {
        public string? pk_stateid { get; set; }
        public string? code { get; set; }

        public string description { get; set; }

        public bool? lwf_applicable { get; set; }

        public bool? pt_applicable { get; set; }

        public string? lwf_applicable_status { get; set; }

        public string? pt_applicable_status { get; set; }

        public string?fk_companyId { get; set; }

        public string? pt_number { get; set; }

        public string? lwf_number { get; set; }

        public string? esi_number { get; set; }
        public string? pf_number { get; set; }
        public decimal? minimum_wages { get; set; }
        public bool? is_minimum_wages { get; set; }
        public string? fk_catid { get; set; }
        public string? category { get; set; }

        public string? is_minimum_wages_status { get; set; }
        public List<StateEarningHeadMst>? earning_heads { get; set; }
        public List<StateCategoryMinWageModel>? category_minimum_wages { get; set; }
    }

    public class StateCategoryMinWageModel
    {
        public string? pk_state_cat_min_wage_id { get; set; }
        public string? fk_stateid { get; set; }
        public string? fk_catid { get; set; }
        public string? category_name { get; set; }
        public decimal? minimum_wages { get; set; }
        public List<StateEarningHeadMst>? earning_heads { get; set; }
    }

    public class StateCategoryMinWageHeadDbModel
    {
        public string? pk_state_cat_min_wage_head_id { get; set; }
        public string? fk_state_cat_min_wage_id { get; set; }
        public string? fk_stateid { get; set; }
        public string? fk_headid { get; set; }
        public string? description { get; set; }
        public string? shortdesc { get; set; }
        public decimal amount { get; set; }
    }

    public class StateEarningHeadMst
    {
        public string? pk_headid { get; set; }
        public string? description { get; set; }
        public string? shortdesc { get; set; }
        public decimal amount { get; set; }
    }
}
